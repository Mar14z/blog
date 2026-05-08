# 博客系统全面重构 Spec

## Why
当前博客存在以下问题需要解决：
1. **文章卡片不可见**：加载成功但CSS动画未触发显示
2. **缺少个性化页面**：没有个人简介、作品集、友链等完整站点的必需页面
3. **部署不便**：需要简化部署流程
4. **代码需要整理**：现有代码结构可进一步优化

## What Changes

### 修复项
- 修复文章卡片加载后不显示的问题（CSS动画触发）
- 统一API响应处理逻辑

### 新增页面
- **个人简介页 (about.html)**：详细的关于页面，包含技能、经历、教育背景
- **作品集页 (portfolio.html)**：展示项目作品、设计案例
- **友情链接页 (links.html)**：友链申请与管理

### 代码优化
- 重构项目结构，添加统一的CSS组件库
- 优化script.js，提取可复用组件
- 添加环境变量配置
- 完善部署脚本

### 部署优化
- 添加Docker支持
- 创建一键部署脚本
- 环境变量配置化
- 添加健康检查接口

## Impact
- Affected specs: 原有极简风格、黑白像素MV风格
- Affected code: styles.css, index.html, script.js, article.html, 新增页面

## Design Language

### 配色方案（纯黑白）
```css
--bg-primary: #000000;
--bg-secondary: #0a0a0a;
--bg-tertiary: #111111;
--bg-card: #1a1a1a;
--border: #2a2a2a;
--text-primary: #ffffff;
--text-secondary: #888888;
--text-dim: #444444;
--accent: #ffffff;
```

### 字体
- 标题: **Press Start 2P** (像素字体)
- 正文: **JetBrains Mono** (等宽字体)
- 中文: **Noto Sans SC** (思源黑体)

### 布局规范
- 最大内容宽度: 1200px
- 移动端断点: 768px
- 卡片间距: 24px
- 页面内边距: 40px (桌面) / 20px (移动)

## ADDED Requirements

### Requirement: 文章卡片可见性修复
文章卡片加载后必须正确显示，不能出现加载成功但不可见的情况。

#### Scenario: 文章列表加载
- **WHEN** 用户打开首页，文章数据加载完成
- **THEN** 文章卡片立即显示，带有淡入动画效果
- **AND** 动画完成后卡片完全可见（opacity: 1）

### Requirement: 个人简介页
系统应提供完整的个人介绍页面。

#### Scenario: 访问个人简介页
- **WHEN** 用户访问 /about.html
- **THEN** 显示个人头像、基本信息、技能列表、经历时间线

#### Page Structure: 个人简介页
```
┌─────────────────────────────────────┐
│  Header (固定导航栏)                │
├─────────────────────────────────────┤
│  Hero Section                       │
│  - 头像 (黑白滤镜)                   │
│  - 姓名/昵称                        │
│  - 一句话介绍                       │
├─────────────────────────────────────┤
│  Skills Section                    │
│  - 技能分类 (设计/编程/其他)         │
│  - 每个技能显示熟练度进度条          │
├─────────────────────────────────────┤
│  Timeline Section                  │
│  - 时间线展示教育/工作经历          │
│  - 按年份分组                       │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

### Requirement: 作品集页
系统应提供项目作品展示页面。

#### Scenario: 访问作品集页
- **WHEN** 用户访问 /portfolio.html
- **THEN** 展示项目列表，每个项目包含封面、标题、描述、标签

#### Page Structure: 作品集页
```
┌─────────────────────────────────────┐
│  Header (固定导航栏)                │
├─────────────────────────────────────┤
│  Page Title                         │
│  "作品集"                           │
├─────────────────────────────────────┤
│  Filter Tabs                        │
│  - 全部 / 网站 / 应用 / 设计         │
├─────────────────────────────────────┤
│  Projects Grid                      │
│  ┌─────────┐ ┌─────────┐           │
│  │ Project │ │ Project │           │
│  │  Card   │ │  Card   │           │
│  └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐           │
│  │ Project │ │ Project │           │
│  │  Card   │ │  Card   │           │
│  └─────────┘ └─────────┘           │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

### Requirement: 友情链接页
系统应提供友链展示和申请页面。

#### Scenario: 访问友链页
- **WHEN** 用户访问 /links.html
- **THEN** 显示当前友链列表，以及申请表单

#### Page Structure: 友链页
```
┌─────────────────────────────────────┐
│  Header (固定导航栏)                │
├─────────────────────────────────────┤
│  Page Title                         │
│  "友情链接"                         │
├─────────────────────────────────────┤
│  My Links                           │
│  ┌─────────┐ ┌─────────┐           │
│  │  Link   │ │  Link   │           │
│  │  Card   │ │  Card   │           │
│  └─────────┘ └─────────┘           │
├─────────────────────────────────────┤
│  Apply Section                     │
│  - 申请说明                         │
│  - 申请表单 (网站名/URL/描述)       │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

### Requirement: 服务器部署支持
系统应支持便捷的服务器部署。

#### Scenario: 部署到生产环境
- **WHEN** 管理员执行部署脚本
- **THEN** 系统自动完成以下步骤：
  - 安装依赖 (npm install)
  - 配置环境变量
  - 启动MongoDB连接
  - 启动服务
  - 配置PM2进程管理

## MODIFIED Requirements

### Requirement: 首页文章加载
#### Original: 文章卡片加载后不显示
#### Modified: 文章卡片加载后立即显示，带有流畅的淡入动画

### Requirement: 导航结构
#### Original: 首页 / 文章 / 关于 / 联系
#### Modified: 首页 / 文章 / 关于 / 作品集 / 友链 / 联系

## Technical Approach

### 文件结构
```
blog/
├── public/              # 静态资源
│   ├── css/
│   │   ├── variables.css    # CSS变量
│   │   ├── base.css         # 基础样式
│   │   ├── components.css   # 组件样式
│   │   └── pages.css        # 页面特定样式
│   ├── js/
│   │   ├── app.js           # 主应用
│   │   ├── components/      # 可复用组件
│   │   └── utils/           # 工具函数
│   └── images/
├── server/              # 后端服务
├── scripts/             # 工具脚本
├── views/               # HTML页面
├── .env.example         # 环境变量模板
├── Dockerfile           # Docker配置
├── docker-compose.yml   # Docker Compose
├── deploy.sh            # 一键部署脚本
└── package.json
```

### 部署方式
1. **传统部署**：npm + PM2
2. **Docker部署**：Docker + Docker Compose
3. **环境变量**：通过.env文件管理敏感配置

### 性能优化
- 图片懒加载
- CSS/JS压缩
- 静态资源CDN
- API响应缓存
