# Tasks

## Phase 1: 安全与基础设施（高优先级）

- [ ] Task 1: 添加安全中间件
  - [ ] 1.1 安装并配置 helmet（HTTP 安全头）
  - [ ] 1.2 安装并配置 compression（gzip 压缩）
  - [ ] 1.3 安装并配置 cors（跨域策略）
  - [ ] 1.4 配置 express-rate-limit（API 限流，登录接口 5次/分钟，其他 100次/分钟）
  - [ ] 1.5 在 app.js 中统一挂载中间件

- [ ] Task 2: XSS 防护
  - [ ] 2.1 安装 dompurify 或 sanitize-html
  - [ ] 2.2 在文章创建/更新路由中添加内容 sanitize
  - [ ] 2.3 在评论/留言等用户输入处添加 sanitize

- [ ] Task 3: 优雅关闭与环境配置
  - [ ] 3.1 添加 SIGTERM/SIGINT 信号处理，关闭数据库连接
  - [ ] 3.2 区分 .env.development 和 .env.production 配置

## Phase 2: SEO 优化（高优先级）

- [ ] Task 4: Open Graph 与 Twitter Card
  - [ ] 4.1 为所有页面添加 og:title, og:description, og:image, og:url
  - [ ] 4.2 为所有页面添加 twitter:card, twitter:title, twitter:description
  - [ ] 4.3 文章详情页动态生成 OG 标签

- [ ] Task 5: JSON-LD 结构化数据
  - [ ] 5.1 首页添加 WebSite + Organization schema
  - [ ] 5.2 文章详情页添加 Article schema（标题/日期/作者/描述）
  - [ ] 5.3 文章列表页添加 Blog schema

- [ ] Task 6: sitemap.xml 与 robots.txt
  - [ ] 6.1 创建 /server/routes/sitemap.js 动态生成 sitemap
  - [ ] 6.2 创建 public/robots.txt
  - [ ] 6.3 添加 canonical URL 到所有页面

## Phase 3: 内容功能增强（中优先级）

- [ ] Task 7: 文章目录 ToC
  - [ ] 7.1 在 article-detail.js 中解析 h2/h3 标题生成目录
  - [ ] 7.2 添加 ToC 侧边栏样式（固定定位、当前标题高亮）
  - [ ] 7.3 点击目录项平滑滚动到对应位置

- [ ] Task 8: 阅读进度条
  - [ ] 8.1 在文章详情页添加顶部进度条
  - [ ] 8.2 使用 scroll 事件 + throttle 计算进度百分比

- [ ] Task 9: 相关文章推荐
  - [ ] 9.1 后端 API 添加 /api/articles/:slug/related 接口（按分类和标签匹配）
  - [ ] 9.2 前端文章详情页底部渲染相关文章卡片

- [ ] Task 10: RSS 订阅
  - [ ] 10.1 安装 feed 库
  - [ ] 10.2 创建 /feed.xml 路由，生成 RSS 2.0 格式
  - [ ] 10.3 在页面 head 中添加 <link rel="alternate" type="application/rss+xml">

## Phase 4: 代码质量（中优先级）

- [ ] Task 11: 提取内联 CSS/JS
  - [ ] 11.1 gallery.html 内联 CSS → public/css/gallery.css
  - [ ] 11.2 gallery.html 内联 JS → public/js/gallery.js
  - [ ] 11.3 index.html 内联 CSS → public/css/home.css
  - [ ] 11.4 articles.html 内联 CSS/JS → public/css/articles.css + public/js/articles.js

- [ ] Task 12: 错误处理完善
  - [ ] 12.1 所有页面 JS 的 fetch 添加 catch 处理，显示友好错误提示
  - [ ] 12.2 图片加载失败添加 onerror 处理（显示占位图）
  - [ ] 12.3 空状态样式统一（图标 + 提示文字 + 操作按钮）

- [ ] Task 13: 可访问性补全
  - [ ] 13.1 所有页面导航添加 aria-label="主导航"
  - [ ] 13.2 当前页面链接添加 aria-current="page"
  - [ ] 13.3 about.html div → section/aside/main 语义标签
  - [ ] 13.4 分享按钮添加 aria-label
  - [ ] 13.5 外部链接统一添加 rel="noopener noreferrer"

## Phase 5: 后端优化（中优先级）

- [ ] Task 14: API 优化
  - [ ] 14.1 分页响应添加 totalPages 字段
  - [ ] 14.2 文章列表 API 添加 sort 参数支持
  - [ ] 14.3 统一 auth 中间件 token 校验逻辑（去重）
  - [ ] 14.4 静态资源添加 Cache-Control 头（max-age=86400）

- [ ] Task 15: 管理后台增强
  - [ ] 15.1 文章添加草稿/发布状态切换
  - [ ] 15.2 添加数据导出功能（JSON 格式）
  - [ ] 15.3 添加文章预览功能

# Task Dependencies
- Task 7 依赖 Task 11（代码提取后再添加功能更清晰）
- Task 9 依赖 Task 14（需要后端 API 支持）
- Task 10 依赖 Task 5（SEO 基础设施先就位）
- Task 1-3 可并行
- Task 4-6 可并行
- Task 11-13 可并行
