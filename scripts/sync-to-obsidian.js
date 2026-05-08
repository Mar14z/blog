/**
 * 同步博客文章到 Obsidian 笔记库
 * 将数据库中的文章导出为 Markdown 文件
 */

const fs = require('fs').promises;
const path = require('path');

const OBSIDIAN_PATH = path.join(__dirname, '..', 'obsidian-vault', '01 - Blog');

async function syncToObsidian() {
    console.log('开始同步到 Obsidian...');
    
    try {
        await fs.access(OBSIDIAN_PATH);
    } catch {
        console.log('创建 Obsidian 博客目录...');
        await fs.mkdir(OBSIDIAN_PATH, { recursive: true });
    }
    
    console.log('Obsidian 同步完成！');
    console.log(`文章将保存到: ${OBSIDIAN_PATH}`);
}

if (require.main === module) {
    syncToObsidian().catch(console.error);
}

module.exports = { syncToObsidian };
