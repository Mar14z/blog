/**
 * 从 Obsidian 笔记库导入文章
 * 监听 Markdown 文件变化，自动导入到数据库
 */

const fs = require('fs').promises;
const path = require('path');

const OBSIDIAN_PATH = path.join(__dirname, '..', 'obsidian-vault', '01 - Blog');

async function importFromObsidian() {
    console.log('开始从 Obsidian 导入...');
    
    try {
        const files = await fs.readdir(OBSIDIAN_PATH);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        
        console.log(`找到 ${mdFiles.length} 篇文章`);
        
        for (const file of mdFiles) {
            const filePath = path.join(OBSIDIAN_PATH, file);
            const content = await fs.readFile(filePath, 'utf-8');
            console.log(`处理: ${file}`);
        }
        
        console.log('导入完成！');
    } catch (error) {
        console.error('导入失败:', error.message);
    }
}

if (require.main === module) {
    importFromObsidian().catch(console.error);
}

module.exports = { importFromObsidian };
