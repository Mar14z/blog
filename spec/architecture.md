# 静墨博客 - 技术架构与文件结构

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js | 20.x |
| 服务框架 | Express | 4.x |
| 数据库 | MongoDB | - |
| 认证 | JWT (jsonwebtoken) | - |
| 前端 | 原生 HTML / CSS / JavaScript | - |

---

## 文件结构

```
blog/
├── server/                      # 服务器端
│   ├── app.js                   # 主应用文件 (Express 配置, 路由挂载, 静态文件服务)
│   ├── config/
│   │   └── database.js          # MongoDB 连接配置
│   ├── middleware/
│   │   ├── auth.js              # JWT 认证中间件
│   │   └── errorHandler.js      # 错误处理中间件
│   ├── models/
│   │   ├── Article.js           # 文章数据模型
│   │   └── User.js              # 用户数据模型
│   └── routes/
│       ├── auth.js              # 认证路由
│       ├── articles.js          # 文章路由
│       └── upload.js            # 上传路由
├── public/                      # 静态资源
│   ├── css/
│   │   ├── variables.css        # CSS 变量定义
│   │   ├── base.css             # 基础样式重置
│   │   ├── components.css       # 公共组件样式
│   │   ├── about.css            # 关于页样式
│   │   ├── links.css            # 友链页样式
│   │   ├── pages.css            # 通用页面样式
│   │   └── portfolio.css        # 作品集样式
│   └── js/
│       ├── utils.js             # 公共工具函数
│       ├── app.js               # 首页逻辑
│       ├── article-detail.js    # 文章详情页逻辑
│       ├── about.js             # 关于页逻辑
│       ├── links.js             # 友链页逻辑
│       └── portfolio.js         # 作品集页逻辑
├── views/                       # 页面模板
│   ├── index.html               # 首页
│   ├── articles.html            # 文章列表页
│   ├── article.html             # 文章详情页
│   ├── about.html               # 关于页
│   ├── portfolio.html           # 作品集页
│   ├── links.html               # 友链页
│   └── gallery.html             # 图库页
├── admin/                       # 管理后台
│   ├── index.html               # 后台页面
│   ├── app.js                   # 后台逻辑
│   └── styles.css               # 后台样式
├── docs/                        # 项目文档
│   ├── deploy-checklist.md      # 部署检查清单
│   ├── render-deployment.md     # Render 部署指南
│   ├── obsidian-bidirectional.md # Obsidian 双向同步说明
│   └── 使用指南.md              # 使用指南
├── scripts/                     # 工具脚本
│   ├── deploy.bat               # Windows 部署脚本
│   ├── deploy.sh                # Linux/Mac 部署脚本
│   ├── export-to-obsidian.js    # 导出到 Obsidian
│   ├── import-from-obsidian.js  # 从 Obsidian 导入
│   ├── refresh-articles.js      # 刷新文章缓存
│   ├── sync-to-obsidian.js      # 同步到 Obsidian
│   └── watch-and-sync.js        # 监听并同步
├── obsidian-vault/              # Obsidian 笔记库
├── uploads/                     # 上传文件目录
├── spec/                        # 项目规范文档
├── package.json                 # 项目依赖配置
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git 忽略规则
├── .dockerignore                # Docker 忽略规则
├── Dockerfile                   # Docker 构建文件
├── docker-compose.yml           # Docker Compose 配置
└── README.md                    # 项目说明
```

---

## CSS 加载顺序

CSS 文件按以下顺序加载，后者可覆盖前者：

```
variables.css → base.css → components.css → 页面专属样式
```

| 顺序 | 文件 | 职责 |
|------|------|------|
| 1 | `variables.css` | 定义 CSS 自定义属性（颜色、字体、间距等） |
| 2 | `base.css` | 重置样式、排版基础、通用元素样式 |
| 3 | `components.css` | 可复用组件样式（导航栏、页脚、Toast 等） |
| 4 | 页面专属 | 各页面特有样式（如 `about.css`、`portfolio.css`） |

---

## JS 加载顺序

JavaScript 文件按以下顺序加载：

```
utils.js → 页面专属脚本
```

| 顺序 | 文件 | 职责 |
|------|------|------|
| 1 | `utils.js` | 公共工具函数（API 请求、日期格式化、Toast 等） |
| 2 | 页面专属 | 各页面业务逻辑（如 `app.js`、`portfolio.js`） |

---

## 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `article-detail.js`、`variables.css` |
| CSS 类名 | kebab-case | `.nav-link`、`.page-header` |
| JavaScript 函数 | camelCase | `formatDate()`、`showToast()` |
| JavaScript 常量 | UPPER_SNAKE_CASE | `API_BASE`、`MAX_LIMIT` |
| CSS 变量 | --kebab-case | `--accent`、`--bg-primary` |

---

## 服务端架构

### 请求处理流程

```
客户端请求
    ↓
Express app.js (路由挂载、静态文件服务)
    ↓
中间件链
    ├── 静态文件匹配 → 直接返回
    ├── /api/auth/* → auth.js 路由
    ├── /api/articles/* → articles.js 路由
    ├── /api/upload/* → auth 中间件 → upload.js 路由
    └── /api/health → 健康检查
    ↓
路由处理函数
    ↓
errorHandler.js (错误处理中间件)
    ↓
统一格式响应
```

### 数据模型

#### Article 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| title | String | 文章标题 |
| slug | String | URL 别名（唯一） |
| content | String | 文章内容（Markdown） |
| category | String | 分类 |
| tags | [String] | 标签数组 |
| featured | Boolean | 是否推荐 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

#### User 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| username | String | 用户名（唯一） |
| password | String | 密码（bcrypt 加密） |
| createdAt | Date | 创建时间 |

---

## 部署架构

```
Docker Container
    ├── Node.js 20.x 运行时
    ├── Express 服务器 (端口 3001)
    ├── MongoDB (外部服务 / Docker Compose)
    └── 静态文件服务 (public/, views/, uploads/)
```

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PORT` | 服务端口 | `3001` |
| `MONGODB_URI` | MongoDB 连接地址 | `mongodb://localhost:27017/blog` |
| `JWT_SECRET` | JWT 签名密钥 | - |
| `NODE_ENV` | 运行环境 | `production` |
