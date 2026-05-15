const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs').promises;

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'D:\\documents\\note';
const BLOG_DIR = process.env.OBSIDIAN_BLOG_DIR || '01 - Blog';
const OBSIDIAN_BLOG_PATH = path.join(VAULT_PATH, BLOG_DIR);

async function syncToObsidian() {
    console.log('开始同步到 Obsidian...');
    console.log(`笔记仓库路径: ${VAULT_PATH}`);

    try {
        await fs.access(VAULT_PATH);
        console.log(`笔记仓库已存在: ${VAULT_PATH}`);
    } catch {
        console.log(`笔记仓库不存在: ${VAULT_PATH}`);
        console.log('请检查 .env 中的 OBSIDIAN_VAULT_PATH 配置');
        return;
    }

    try {
        await fs.access(OBSIDIAN_BLOG_PATH);
    } catch {
        console.log('创建博客目录...');
        await fs.mkdir(OBSIDIAN_BLOG_PATH, { recursive: true });
    }

    console.log('Obsidian 同步完成！');
    console.log(`文章将保存到: ${OBSIDIAN_BLOG_PATH}`);
}

if (require.main === module) {
    syncToObsidian().catch(console.error);
}

module.exports = { syncToObsidian };
