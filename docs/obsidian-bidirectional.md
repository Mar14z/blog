# 博客与 Obsidian 双向同步指南

笔记仓库独立于博客项目，位于 `D:\documents\note`，通过 Git 进行版本管理和远程同步。

## 架构概览

```
本地 Obsidian (D:\documents\note)
    ↕ git push / pull
GitHub 仓库 (Mar14z/note)
    ↕ git pull（服务器端）
博客服务器 → import-from-obsidian.js → MongoDB → 前端展示
```

## 笔记仓库结构

```
D:\documents\note/
├── 00 - Index/          # 索引和总览
│   └── 博客文章索引.md   # 自动生成的双链索引
├── 01 - Blog/           # 博客文章（发布区）
│   └── *.md             # 带 frontmatter 的文章
└── 02 - Notes/          # 笔记区（PARA 分类法）
    ├── 00 - Inbox/      # 收集箱
    ├── 01 - Learning/   # 学习笔记
    ├── 02 - Projects/   # 项目笔记
    ├── 03 - Areas/      # 领域研究
    └── 04 - Resources/  # 资源收藏
```

## 同步流程

### 博客 → Obsidian（导出）

当在管理后台创建或编辑文章时，系统将文章导出为 Markdown 文件到笔记仓库的 `01 - Blog/` 目录。

```bash
node scripts/export-to-obsidian.js
```

### Obsidian → 博客（导入）

将 Markdown 文件放入 `01 - Blog/` 目录后，运行导入脚本解析 Frontmatter 并写入数据库。

```bash
node scripts/import-from-obsidian.js
```

### 服务器端同步（Git-Based，待实现）

```
1. 本地写文章 → git push 到 GitHub
2. 服务器定时/手动 git pull
3. import-from-obsidian.js 解析并写入 MongoDB
```

触发方式：
- **手动触发**：管理后台点击同步按钮
- **定时拉取**：服务器 cron 定时 git pull + 导入
- **Webhook**：GitHub Webhook 通知服务器拉取

## 使用方法

### 1. 本地写作

在 Obsidian 中打开 `D:\documents\note`，在 `01 - Blog/` 下创建文章。

### 2. 发布文章

添加 Frontmatter 后，将文件放在 `01 - Blog/` 目录：

```markdown
---
title: 文章标题
category: 编程
tags:
  - JavaScript
date: 2024-01-01
published: true
---

文章内容...
```

### 3. 推送到 GitHub

```bash
cd D:\documents\note
git add .
git commit -m "新文章: 文章标题"
git push
```

### 4. 服务器同步

```bash
# 手动触发
node scripts/import-from-obsidian.js

# 刷新索引
node scripts/refresh-articles.js
```

## 环境变量配置

在 `.env` 中配置笔记仓库路径：

```env
OBSIDIAN_VAULT_PATH=D:\documents\note
OBSIDIAN_BLOG_DIR=01 - Blog
OBSIDIAN_INDEX_DIR=00 - Index
OBSIDIAN_GIT_REPO=https://github.com/Mar14z/note.git
```

## 注意事项

1. **Frontmatter 是必需的** — 至少包含 `title` 和 `category`
2. **文件名规则** — 使用英文或拼音，避免特殊字符
3. **图片处理** — 建议使用图床链接，或放在仓库的 `assets/` 目录
4. **编码** — 确保文件为 UTF-8 编码

## 相关文件

| 文件 | 说明 |
|------|------|
| `scripts/import-from-obsidian.js` | 从笔记仓库导入文章到数据库 |
| `scripts/export-to-obsidian.js` | 从数据库导出文章到笔记仓库 |
| `scripts/refresh-articles.js` | 刷新博客文章索引 |
| `scripts/sync-to-obsidian.js` | 同步到 Obsidian |
| `scripts/watch-and-sync.js` | 监控本地文件变化（开发环境） |
