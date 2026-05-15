# 静墨博客

> 极简优雅的博客系统，支持 Obsidian 双向同步

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-green" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-7.0-blue" alt="MongoDB">
  <img src="https://img.shields.io/badge/Obsidian-集成-purple" alt="Obsidian">
</p>

---

## 🚀 一键启动

```
npm start
```

启动后访问 http://localhost:3000

---

## 🌐 访问地址

- 博客：http://localhost:3000
- 管理：http://localhost:3000/admin
- 账户：admin / admin123

---

## 📝 Obsidian 工作流

笔记仓库独立于博客项目，位于 `D:\documents\note`，通过 Git 同步。

### 发布文章

1. 在 Obsidian 中写笔记（`02 - Notes/`）
2. 添加 Frontmatter 元数据
3. 将文件移动到 `01 - Blog/`
4. `git push` 推送到 GitHub
5. 服务器拉取并同步到博客

### Frontmatter 格式

```markdown
---
title: "文章标题"
category: "技术"
tags:
  - JavaScript
published: true
---
```

---

## 📂 笔记仓库结构

```
D:\documents\note/
├── 00 - Index/      # 📖 索引总览
├── 01 - Blog/       # 📝 博客文章（发布到这里）
└── 02 - Notes/      # 📚 个人笔记
    ├── 00 - Inbox/  # 收集箱
    ├── 01 - Learning/# 学习笔记
    ├── 02 - Projects/# 项目笔记
    ├── 03 - Areas/  # 领域研究
    └── 04 - Resources/# 资源收藏
```

---

## 🎯 常用命令

| 命令 | 说明 |
|------|------|
| `scripts\deploy.bat` | Windows 部署 |
| `bash scripts/deploy.sh` | Linux/Mac 部署 |

---

## 📚 文档

- [项目规范文档](spec/README.md)
- [使用指南](docs/使用指南.md)
- [部署清单](docs/deploy-checklist.md)
- [Render 部署指南](docs/render-deployment.md)
- [Obsidian 双向同步](docs/obsidian-bidirectional.md)

---

## 🛠️ 技术栈

- Node.js + Express
- MongoDB
- JWT 认证
- Git 同步笔记仓库
- 原生 HTML/CSS/JavaScript

---

## 🐛 常见问题

| 问题 | 解决 |
|------|------|
| 无法启动 | 检查 MongoDB 是否运行 |
| 无法登录 | 检查 .env 中的管理员配置 |
| 同步失效 | 检查 .env 中的 OBSIDIAN_VAULT_PATH 配置 |

---

**享受极简写作与知识管理的完美结合！** ✨
