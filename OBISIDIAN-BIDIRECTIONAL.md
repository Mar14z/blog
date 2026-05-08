# 博客与 Obsidian 双向同步指南

本文档说明如何实现博客系统与 Obsidian 笔记库之间的双向同步。

## 同步机制

### 博客 → Obsidian
当在管理后台创建或编辑文章时，系统会自动将文章导出为 Markdown 文件到 `obsidian-vault/01 - Blog/` 目录。

### Obsidian → 博客
将 Markdown 文件放入 `obsidian-vault/01 - Blog/` 目录后，运行导入脚本即可将文章导入到数据库。

## 使用方法

### 1. 启动监控（推荐）
```bash
node scripts/watch-and-sync.js
```
这会监控 Obsidian 目录的变化，自动同步到数据库。

### 2. 手动同步
```bash
# 从 Obsidian 导入
node scripts/import-from-obsidian.js

# 导出到 Obsidian
node scripts/export-to-obsidian.js
```

### 3. 刷新索引
```bash
node scripts/refresh-articles.js
```

## Obsidian 配置

### 建议的 Obsidian 设置

1. **Vault 位置**：使用 `obsidian-vault` 作为 Vault
2. **插件建议**：
   - Templater（模板管理）
   - Dataview（数据查询）
   - Calendar（日历视图）

### 文章模板

```markdown
---
title: 文章标题
category: 分类
tags:
  - 标签1
  - 标签2
date: 2024-01-01
published: true
---

文章内容在这里...
```

## 注意事项

1. **frontmatter 是必需的**
   - `title`: 文章标题
   - `category`: 分类（编程/产品/读书/随笔）
   - `tags`: 标签数组
   - `date`: 发布日期
   - `published`: 是否发布

2. **文件名规则**
   - 使用英文或拼音作为文件名
   - 避免特殊字符
   - 保持简洁

3. **图片处理**
   - 建议使用图床链接
   - 或将图片放在 `obsidian-vault/assets/` 目录

## 故障排除

### 问题：文章没有同步
- 检查 frontmatter 是否完整
- 确认 `published: true`
- 查看控制台错误信息

### 问题：中文乱码
- 确保文件编码为 UTF-8
- Obsidian 默认使用 UTF-8

## 相关文件

- `scripts/sync-to-obsidian.js` - 同步脚本
- `scripts/import-from-obsidian.js` - 导入脚本
- `scripts/watch-and-sync.js` - 监控脚本
- `scripts/export-to-obsidian.js` - 导出脚本
- `scripts/refresh-articles.js` - 索引刷新

---
更新时间: 2024-05-07
