const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const articleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  coverImage: String,
  category: String,
  tags: [String],
  readTime: Number,
  published: Boolean,
  featured: Boolean,
  viewCount: Number,
  publishedAt: Date,
  createdAt: Date
}, { timestamps: true });

async function exportToObsidian() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const Article = mongoose.model('Article', articleSchema);
    const articles = await Article.find({ published: true }).sort({ createdAt: -1 });

    const vaultPath = path.join(__dirname, '..', 'obsidian-vault');
    const articlesPath = path.join(vaultPath, '01 - Blog');
    const indexPath = path.join(vaultPath, '00 - Index');
    
    await fs.mkdir(articlesPath, { recursive: true });
    await fs.mkdir(indexPath, { recursive: true });
    console.log('✓ Created vault directories');

    const exportedFiles = [];

    for (const article of articles) {
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
---

# ${article.title}

> ${article.excerpt}

${article.content.split('\n\n').map(para => {
  para = para.trim();
  if (!para) return '';
  if (para.startsWith('## ')) return para;
  if (para.startsWith('### ')) return para;
  if (para.startsWith('> ')) return `> ${para.substring(2)}`;
  if (para.startsWith('- ')) return para;
  return para;
}).join('\n\n')}
`;

      await fs.writeFile(filePath, frontmatter, 'utf-8');
      exportedFiles.push({
        title: article.title,
        slug: article.slug,
        category: article.category,
        tags: article.tags
      });
      console.log(`✓ Exported: ${article.title}`);
    }

    const indexContent = `# 博客文章索引

> 自动生成于 ${new Date().toLocaleString('zh-CN')}

## 统计信息

- **文章总数**: ${exportedFiles.length}
- **最后更新**: ${new Date().toLocaleString('zh-CN')}

## 按分类

${[...new Set(exportedFiles.map(a => a.category))].map(cat => `
### ${cat}

${exportedFiles.filter(a => a.category === cat).map(a => `- [[${a.slug}|${a.title}]]`).join('\n')}
`).join('\n')}

## 所有文章

${exportedFiles.map(a => `- [[${a.slug}|${a.title}]] - ${a.category}`).join('\n')}
`;

    await fs.writeFile(path.join(indexPath, '博客文章索引.md'), indexContent, 'utf-8');
    console.log('✓ Created index');

    await fs.writeFile(path.join(vaultPath, 'README.md'), `# 博客 Obsidian 知识库

> 自动化管理的知识库

## 说明

此文件夹由博客系统自动生成，包含所有已发布的文章。

## 目录结构

- \`01 - Blog Articles/\` - 所有博客文章
- \`00 - Inbox/\` - 文章索引

## 同步说明

每次运行导出脚本时，文章会自动更新到相应位置。

## 最后同步

${new Date().toLocaleString('zh-CN')}
`, 'utf-8');

    console.log('');
    console.log('================================');
    console.log('  Export Complete!');
    console.log('================================');
    console.log('');
    console.log(`Total articles: ${exportedFiles.length}`);
    console.log(`Vault location: ${vaultPath}`);
    console.log('');
    console.log('You can now open this folder in Obsidian!');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

exportToObsidian();
