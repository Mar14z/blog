const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'D:\\documents\\note';
const BLOG_DIR = process.env.OBSIDIAN_BLOG_DIR || '01 - Blog';
const OBSIDIAN_BLOG_PATH = path.join(VAULT_PATH, BLOG_DIR);

console.log('开始监控 Obsidian 笔记库变化...');
console.log(`监控目录: ${OBSIDIAN_BLOG_PATH}`);

try {
    fs.accessSync(OBSIDIAN_BLOG_PATH);
} catch {
    console.error(`目录不存在: ${OBSIDIAN_BLOG_PATH}`);
    console.error('请检查 .env 中的 OBSIDIAN_VAULT_PATH 配置');
    process.exit(1);
}

let watcher;

try {
    watcher = fs.watch(OBSIDIAN_BLOG_PATH, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
            console.log(`[${new Date().toLocaleTimeString()}] 检测到变化: ${eventType} - ${filename}`);
            console.log('准备同步到数据库...');
        }
    });

    console.log('监控已启动，按 Ctrl+C 停止');
} catch (error) {
    console.error('启动监控失败:', error.message);
    console.log('请确保笔记仓库目录存在');
}
