/**
 * 刷新文章索引
 * 重建博客文章索引文件
 */

const fs = require('fs').promises;
const path = require('path');

const OBSIDIAN_PATH = path.join(__dirname, '..', 'obsidian-vault');
const INDEX_PATH = path.join(OBSIDIAN_PATH, '00 - Index', '博客文章索引.md');

async function refreshIndex() {
    console.log('开始刷新文章索引...');
    
    try {
        const blogPath = path.join(OBSIDIAN_PATH, '01 - Blog');
        const files = await fs.readdir(blogPath);
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
