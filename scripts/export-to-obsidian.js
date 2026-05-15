const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs').promises;

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'D:\\documents\\note';
const BLOG_DIR = process.env.OBSIDIAN_BLOG_DIR || '01 - Blog';
const OBSIDIAN_BLOG_PATH = path.join(VAULT_PATH, BLOG_DIR);

async function exportToObsidian(articles = []) {
    console.log('开始导出文章到 Obsidian...');
    console.log(`笔记仓库路径: ${OBSIDIAN_BLOG_PATH}`);

    if (!articles || articles.length === 0) {
        console.log('没有文章需要导出');
        return;
    }

    try {
        await fs.access(OBSIDIAN_BLOG_PATH);
    } catch {
        await fs.mkdir(OBSIDIAN_BLOG_PATH, { recursive: true });
    }

    let exported = 0;

    for (const article of articles) {
        const filename = `${article.slug || article.title}.md`;
        const filepath = path.join(OBSIDIAN_BLOG_PATH, filename);

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
    console.log(`保存位置: ${OBSIDIAN_BLOG_PATH}`);
}

if (require.main === module) {
    console.log('请通过 API 调用此脚本');
}

module.exports = { exportToObsidian };
