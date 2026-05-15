const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs').promises;

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'D:\\documents\\note';
const BLOG_DIR = process.env.OBSIDIAN_BLOG_DIR || '01 - Blog';
const INDEX_DIR = process.env.OBSIDIAN_INDEX_DIR || '00 - Index';
const OBSIDIAN_BLOG_PATH = path.join(VAULT_PATH, BLOG_DIR);
const INDEX_PATH = path.join(VAULT_PATH, INDEX_DIR, '博客文章索引.md');

async function refreshIndex() {
    console.log('开始刷新文章索引...');
    console.log(`笔记仓库路径: ${VAULT_PATH}`);

    try {
        const files = await fs.readdir(OBSIDIAN_BLOG_PATH);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        let index = `# 博客文章索引\n\n`;
        index += `> 最后更新: ${new Date().toLocaleDateString('zh-CN')}\n\n`;
        index += `## 文章列表\n\n`;

        for (const file of mdFiles) {
            const title = file.replace('.md', '');
            index += `- [[${title}]]\n`;
        }

        index += `\n---\n\n`;
        index += `**总计**: ${mdFiles.length} 篇文章\n`;

        await fs.mkdir(path.dirname(INDEX_PATH), { recursive: true });
        await fs.writeFile(INDEX_PATH, index, 'utf-8');
        console.log(`索引已更新: ${INDEX_PATH}`);
    } catch (error) {
        console.error('刷新索引失败:', error.message);
    }
}

if (require.main === module) {
    refreshIndex().catch(console.error);
}

module.exports = { refreshIndex };
