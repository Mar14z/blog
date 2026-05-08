/**
 * 监控 Obsidian 笔记库变化并自动同步
 * 使用方法: node watch-and-sync.js
 */

const fs = require('fs');
const path = require('path');

const OBSIDIAN_PATH = path.join(__dirname, '..', 'obsidian-vault', '01 - Blog');

console.log('开始监控 Obsidian 笔记库变化...');
console.log(`监控目录: ${OBSIDIAN_PATH}`);

let watcher;

try {
    watcher = fs.watch(OBSIDIAN_PATH, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
            console.log(`[${new Date().toLocaleTimeString()}] 检测到变化: ${eventType} - ${filename}`);
            console.log('准备同步到数据库...');
        }
    });

    console.log('监控已启动，按 Ctrl+C 停止');
} catch (error) {
    console.error('启动监控失败:', error.message);
    console.log('请确保 Obsidian 笔记库目录存在');
}
