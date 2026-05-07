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
双击 start-all.bat
```

自动完成：MongoDB检查 + 依赖安装 + 服务器启动 + Obsidian监控

---

## 🌐 访问地址

- 博客：http://localhost:3000
- 管理：http://localhost:3000/admin
- 账户：admin / admin123

---

## 📝 Obsidian 工作流

### 发布文章

1. 在 `obsidian-vault/02 - Notes/` 写笔记
2. 添加 Frontmatter 元数据
3. 将文件移动到 `obsidian-vault/01 - Blog/`
4. 自动同步到博客！

### Frontmatter 格式

```markdown
---
title: "文章标题"
category: "技术"
tags: ["JavaScript"]
published: true
---
```

---

## 📂 目录结构

```
obsidian-vault/
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
| `start-all.bat` | 一键启动（推荐） |
| `node reset-admin.js` | 重置管理员密码 |

---

## 📚 文档

- [完整开发文档](obsidian-vault/00 - Index/📊%20开发文档.md)
- [Obsidian 知识库说明](obsidian-vault/README.md)

---

## 🛠️ 技术栈

- Node.js + Express
- MongoDB
- JWT 认证
- Chokidar 文件监控
- 原生 HTML/CSS/JavaScript

---

## 🐛 常见问题

| 问题 | 解决 |
|------|------|
| 无法启动 | `net start MongoDB` |
| 无法登录 | `node reset-admin.js` |
| 同步失效 | 检查笔记格式和路径 |

---

**享受极简写作与知识管理的完美结合！** ✨
