const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function syncSingleArticle(articleId) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const articleSchema = new mongoose.Schema({}, { timestamps: true });
    const Article = mongoose.model('Article', articleSchema);

    const article = await Article.findById(articleId);
    if (!article) {
      console.error('Article not found:', articleId);
      process.exit(1);
    }

    const vaultPath = path.join(__dirname, '..', 'obsidian-vault');
    const articlesPath = path.join(vaultPath, '01 - Blog');
    await fs.mkdir(articlesPath, { recursive: true });

    const fileName = `${article.slug}.md`;
    const filePath = path.join(articlesPath, fileName);

    const frontmatter = `---
title: "${article.title}"
slug: "${article.slug}"
created: ${article.createdAt.toISOString()}
published: ${article.published}
category: "${article.category}"
tags: [${article.tags.map(t => `"${t}"`).join(', ')}]
readTime: ${article.readTime}
viewCount: ${article.viewCount}
source: blog
syncedAt: ${new Date().toISOString()}
---

# ${article.title}

> ${article.excerpt}

## 基本信息

- **分类**: [[${article.category}]]
- **标签**: ${article.tags.map(t => `#${t}`).join(' ')}
- **阅读时间**: ${article.readTime} 分钟
- **阅读量**: ${article.viewCount} 次
- **发布日期**: ${new Date(article.publishedAt).toLocaleDateString('zh-CN')}

---

## 文章内容

${article.content.split('\n\n').map(para => {
  para = para.trim();
  if (!para) return '';
  if (para.startsWith('## ')) return para;
  if (para.startsWith('### ')) return para;
  if (para.startsWith('> ')) return `> ${para.substring(2)}`;
  if (para.startsWith('- ')) return para;
  return para;
}).join('\n\n')}

---

## 相关链接

${article.tags.map(tag => `- #${tag}`).join('\n')}

---

*本文由博客系统自动同步 | [[${article.slug}|原始链接]]*
`;

    await fs.writeFile(filePath, frontmatter, 'utf-8');
    console.log(`✓ Synced: ${article.title}`);
    console.log(`  Location: ${filePath}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error.message);
    process.exit(1);
  }
}

const articleId = process.argv[2];
if (!articleId) {
  console.error('Usage: node sync-single.js <article-id>');
  process.exit(1);
}

syncSingleArticle(articleId);
