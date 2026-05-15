const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs').promises;

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'D:\\documents\\note';
const BLOG_DIR = process.env.OBSIDIAN_BLOG_DIR || '01 - Blog';
const OBSIDIAN_BLOG_PATH = path.join(VAULT_PATH, BLOG_DIR);

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!match) return { metadata: {}, body: content };

    const frontmatter = match[1];
    const body = content.slice(match[0].length);
    const metadata = {};

    for (const line of frontmatter.split('\n')) {
        const [key, ...rest] = line.split(':');
        const value = rest.join(':').trim();
        if (key && value) {
            if (value.startsWith('[')) {
                metadata[key.trim()] = value
                    .replace(/[\[\]]/g, '')
                    .split(',')
                    .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
                    .filter(Boolean);
            } else {
                metadata[key.trim()] = value.replace(/^['"]|['"]$/g, '');
            }
        }
    }

    return { metadata, body };
}

async function importFromObsidian() {
    console.log('开始从 Obsidian 导入...');
    console.log(`笔记仓库路径: ${OBSIDIAN_BLOG_PATH}`);

    try {
        await fs.access(OBSIDIAN_BLOG_PATH);
    } catch {
        console.error(`博客目录不存在: ${OBSIDIAN_BLOG_PATH}`);
        console.error('请检查 .env 中的 OBSIDIAN_VAULT_PATH 配置');
        return [];
    }

    try {
        const files = await fs.readdir(OBSIDIAN_BLOG_PATH);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        console.log(`找到 ${mdFiles.length} 篇文章`);

        const articles = [];
        for (const file of mdFiles) {
            const filePath = path.join(OBSIDIAN_BLOG_PATH, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const { metadata, body } = parseFrontmatter(content);

            const article = {
                title: metadata.title || file.replace('.md', ''),
                slug: file.replace('.md', '').toLowerCase().replace(/\s+/g, '-'),
                category: metadata.category || '其他',
                tags: metadata.tags || [],
                content: body,
                excerpt: body.slice(0, 200).replace(/[#*\n]/g, '').trim(),
                published: metadata.published !== 'false',
                fromObsidian: true,
                obsidianPath: filePath,
                readTime: Math.max(1, Math.ceil(body.length / 500))
            };

            articles.push(article);
            console.log(`处理: ${file} [${article.category}] ${article.published ? '✓ 已发布' : '○ 草稿'}`);
        }

        console.log('导入完成！');
        return articles;
    } catch (error) {
        console.error('导入失败:', error.message);
        return [];
    }
}

if (require.main === module) {
    importFromObsidian().then(articles => {
        console.log(`\n共解析 ${articles.length} 篇文章`);
    }).catch(console.error);
}

module.exports = { importFromObsidian, parseFrontmatter, OBSIDIAN_BLOG_PATH };
