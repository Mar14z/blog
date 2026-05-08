/**
 * 导出数据库文章到 Obsidian
 * 将所有文章导出为独立的 Markdown 文件
 */

const fs = require('fs').promises;
const path = require('path');

const OBSIDIAN_PATH = path.join(__dirname, '..', 'obsidian-vault', '01 - Blog');

async function exportToObsidian(articles = []) {
    console.log('开始导出文章到 Obsidian...');
    
    if (!articles || articles.length === 0) {
        console.log('没有文章需要导出');
        return;
    }
    
    try {
        await fs.access(OBSIDIAN_PATH);
    } catch {
        await fs.mkdir(OBSIDIAN_PATH, { recursive: true });
    }
    
    let exported = 0;
    
    for (const article of articles) {
        const filename = `${article.slug || article.title}.md`;
        const filepath = path.join(OBSIDIAN_PATH, filename);
        
        const frontmatter = `---
title: ${article.title}
category: ${article.category || '未分类'}
tags:
${(article.tags || []).map(t => `  - ${t}`).join('\n')}
date: ${new Date(article.createdAt).toISOString().split('T')[0]}
published: ${article.published !== false}
---

`;
        
        const content = frontmatter + (article.content || article.excerpt || '');
        
        await fs.writeFile(filepath, content, 'utf-8');
        exported++;
    }
    
    console.log(`导出完成！共导出 ${exported} 篇文章`);
    console.log(`保存位置: ${OBSIDIAN_PATH}`);
}

if (require.main === module) {
    console.log('请通过 API 调用此脚本');
}

module.exports = { exportToObsidian };
