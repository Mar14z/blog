const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs').promises;
const crypto = require('crypto');
const mongoose = require('mongoose');
const Article = require('../server/models/Article');

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'D:\\documents\\note';
const BLOG_DIR = process.env.OBSIDIAN_BLOG_DIR || '01 - Blog';
const OBSIDIAN_BLOG_PATH = path.join(VAULT_PATH, BLOG_DIR);

// Article 模型允许的分类，超出范围的兜底为「其他」
const VALID_CATEGORIES = ['设计', '技术', '生活', '随笔', '编程', '项目', '产品', '读书', '其他'];

function stripQuotes(str) {
    return String(str).replace(/^['"]|['"]$/g, '').trim();
}

// 解析 frontmatter：支持 `key: value`、行内数组 `[a, b]`、多行 YAML 列表（- item）
function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) return { metadata: {}, body: content };

    const lines = match[1].split(/\r?\n/);
    const body = content.slice(match[0].length);
    const metadata = {};
    let listKey = null;

    for (const line of lines) {
        // 多行列表项： "  - 读书笔记"
        const listItem = line.match(/^\s+-\s+(.*)$/);
        if (listItem && listKey) {
            metadata[listKey].push(stripQuotes(listItem[1]));
            continue;
        }
        // 键值对： "title: 标题"
        const kv = line.match(/^([^:\s][^:]*):\s*(.*)$/);
        if (!kv) continue;
        const key = kv[1].trim();
        const value = kv[2].trim();
        if (!value) {
            // 空值视为多行列表的开头（如 tags:）
            metadata[key] = [];
            listKey = key;
            continue;
        }
        listKey = null;
        if (value.startsWith('[')) {
            metadata[key] = value
                .replace(/[\[\]]/g, '')
                .split(',')
                .map(s => stripQuotes(s))
                .filter(Boolean);
        } else {
            metadata[key] = stripQuotes(value);
        }
    }

    return { metadata, body };
}

// 生成合法 slug（仅小写字母/数字/连字符）；纯中文等非 ASCII 用稳定短哈希兜底
function slugify(filename) {
    const base = filename
        .replace(/\.md$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    if (base) return base;
    const hash = crypto.createHash('md5').update(filename).digest('hex').slice(0, 8);
    return `post-${hash}`;
}

// 首屏指标，frontmatter 写法：
//   metrics:
//     - --fast 耗时 | 8.4s | 1.07s
//     - 差分测试 | 3 个旧 bug
function parseMetrics(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => {
        const parts = String(item).split('|').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 3) return { label: parts[0], from: parts[1], to: parts[2] };
        if (parts.length === 2) return { label: parts[0], to: parts[1] };
        return { label: parts[0] || '' };
    }).filter(m => m.label);
}

// 解析 01 - Blog 下的所有 md，返回文章对象数组（不写库）
async function parseArticles() {    await fs.access(OBSIDIAN_BLOG_PATH);

    const files = (await fs.readdir(OBSIDIAN_BLOG_PATH)).filter(f => f.endsWith('.md'));
    const articles = [];

    for (const file of files) {
        const filePath = path.join(OBSIDIAN_BLOG_PATH, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { metadata, body } = parseFrontmatter(content);

        const category = VALID_CATEGORIES.includes(metadata.category) ? metadata.category : '其他';
        const excerpt = (metadata.excerpt
            || body.replace(/[#*`>\-\n\r]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
            || metadata.title
            || file).slice(0, 500);

        articles.push({
            file,
            filePath,
            title: metadata.title || file.replace(/\.md$/i, ''),
            category,
            tags: Array.isArray(metadata.tags) ? metadata.tags : [],
            metrics: parseMetrics(metadata.metrics),
            content: body,
            excerpt,
            published: metadata.published !== 'false',
            date: metadata.date || '',
            readTime: Math.max(1, Math.ceil(body.length / 500))
        });
    }

    return articles;
}

// 为一个文件解析出唯一 slug：已有文章沿用原 slug，新文章按文件名生成并避免冲突
async function resolveSlug(file, filePath, existingSlug) {
    if (existingSlug) return existingSlug;
    const base = slugify(file);
    let slug = base;
    let i = 1;
    while (await Article.exists({ slug, obsidianPath: { $ne: filePath } })) {
        i += 1;
        slug = `${base}-${i}`;
    }
    return slug;
}

// 解析并写入数据库（按 obsidianPath 做 upsert，已存在则更新）
async function importFromObsidian() {
    console.log('开始从 Obsidian 导入...');
    console.log(`笔记仓库路径: ${OBSIDIAN_BLOG_PATH}`);

    let articles;
    try {
        articles = await parseArticles();
    } catch (err) {
        console.error(`笔记目录不存在或读取失败: ${OBSIDIAN_BLOG_PATH}`);
        console.error('请检查 .env 中的 OBSIDIAN_VAULT_PATH 配置');
        return { created: 0, updated: 0, total: 0 };
    }

    console.log(`找到 ${articles.length} 篇文章`);

    let created = 0;
    let updated = 0;

    for (const item of articles) {
        try {
            const existing = await Article.findOne({ obsidianPath: item.filePath });
            const slug = await resolveSlug(item.file, item.filePath, existing && existing.slug);

            const set = {
                title: item.title,
                slug,
                excerpt: item.excerpt,
                content: item.content,
                category: item.category,
                tags: item.tags,
                metrics: item.metrics,
                published: item.published,
                readTime: item.readTime,
                fromObsidian: true,
                obsidianPath: item.filePath
            };
            // pre('save') 钩子对 findOneAndUpdate 不生效，publishedAt 手动维护
            // 有 date 时以笔记 frontmatter 为准（保证日期修改能同步），否则仅在首次发布时写入
            if (item.published) {
                if (item.date) set.publishedAt = new Date(item.date);
                else if (!existing || !existing.publishedAt) set.publishedAt = new Date();
            }

            await Article.findOneAndUpdate(
                { obsidianPath: item.filePath },
                { $set: set },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            if (existing) updated += 1;
            else created += 1;

            console.log(`  ${existing ? '更新' : '新增'}: ${item.file} [${item.category}] ${item.published ? '已发布' : '草稿'}`);
        } catch (err) {
            console.error(`  导入失败: ${item.file} - ${err.message}`);
        }
    }

    console.log(`导入完成：新增 ${created} 篇，更新 ${updated} 篇`);
    return { created, updated, total: articles.length };
}

if (require.main === module) {
    (async () => {
        try {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog');
            const result = await importFromObsidian();
            await mongoose.disconnect();
            process.exit(result.total >= 0 ? 0 : 1);
        } catch (err) {
            console.error('导入失败:', err.message);
            await mongoose.disconnect().catch(() => {});
            process.exit(1);
        }
    })();
}

module.exports = { importFromObsidian, parseArticles, parseFrontmatter, OBSIDIAN_BLOG_PATH };