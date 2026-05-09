# 更新日志与待办

> 静墨博客（JingMo Blog）项目变更记录与待办事项追踪。

---

## 更新日志

### 2026-05-10（第三轮 - 全站优化）

**Phase 1: 安全与基础设施**
- 安装并配置 helmet / compression / cors / rate-limit 中间件
- XSS 防护：sanitize-html 处理文章内容
- 优雅关闭：SIGTERM/SIGINT 信号处理
- 静态资源缓存头（生产 1d/7d，开发 0）

**Phase 2: SEO 优化**
- 所有 7 个页面添加 Open Graph + Twitter Card 标签
- 文章详情页动态更新 OG 标签
- 首页添加 WebSite JSON-LD，文章页添加 Article JSON-LD
- 创建 sitemap.xml 动态生成路由
- 创建 robots.txt
- 所有页面添加 canonical URL

**Phase 3: 内容功能增强**
- 文章详情页添加 ToC 目录导航（IntersectionObserver 高亮）
- 文章详情页添加阅读进度条（红色，顶部 3px）
- 相关文章推荐（后端 API + 前端三列卡片）
- RSS 订阅（/feed.xml，feed 库生成 RSS 2.0）

**Phase 4: 代码质量**
- gallery.html 内联 CSS/JS 提取到外部文件（gallery.css / gallery.js）
- 所有 fetch 调用添加 catch 错误处理 + showToast
- 7 个页面导航添加 aria-label="主导航"
- 7 个页面 active 链接添加 aria-current="page"
- 外部链接补全 rel="noopener noreferrer"
- 分享按钮添加 aria-label

**Phase 5: 后端优化**
- 文章列表 API 添加 sort/order 参数支持
- auth 路由 JWT 验证逻辑去重（使用 protect 中间件）
- 管理后台：草稿/发布状态切换按钮
- 管理后台：文章预览功能
- 管理后台：数据导出功能

### 2026-05-10（第二轮）

- 全站多维度审查完成（前端UX/后端架构/SEO内容/代码质量）
- 发现 50+ 优化项，按优先级分为 5 个阶段
- 创建优化方案 spec（.trae/specs/site-wide-optimization/）

### 2026-05-10

- 创建 spec 树状结构规范文件夹
- 新增独立文章列表页 (`/articles`)
- 主页文章精简为 2 排预览 + "查看全部"链接
- 相册页加载优化：骨架屏 + `requestIdleCallback` + `IntersectionObserver`
- 导航栏字号增大（logo 1.75rem, links 0.95rem）
- 导航 active 焦点效果修复（about/article 页面）
- 全局隐藏滚动条
- 所有页面"文章"链接从 `/#articles` 改为 `/articles`
- API limit 上限从 50 放宽到 200
- Unsplash `preconnect` 改为 `dns-prefetch`

### 2026-05-09

- 完成界面风格统一（黑白极简风格）
- 新增相册页面
- 统一导航栏语言为中文
- 创建公共工具模块（`utils.js`）
- 优化 CSS 架构，减少重复代码

---

## 审查问题追踪

| 问题 | 文件 | 状态 |
|------|------|------|
| `pages.css` 重复 `.filter-btn` | `pages.css` | ✅ 已优化 |
| `portfolio.css` 重复 `.page-*` | `portfolio.css` | ✅ 已优化 |
| `API_BASE` 重复定义 | 多个 JS | ✅ 提取到 `utils.js` |
| `showToast` 重复定义 | 多个 JS | ✅ 提取到 `utils.js` |
| `scroll` 事件无防抖 | 多个 JS | ✅ 添加 throttle |
| Observer 内存泄漏 | 多个 JS | ✅ 添加 `disconnect()` |
| 导航缺少 `aria-label` | 所有页面 | ✅ 已添加 |
| `about.html` div 代替语义标签 | `about.html` | ⏳ 待修复 |
| 相册页面卡顿 | `gallery.html` | ✅ 骨架屏+懒加载 |
| 缺少 Open Graph 标签 | 所有页面 | ✅ 已添加 |
| 缺少 JSON-LD 结构化数据 | 首页/文章页 | ✅ 已添加 |
| 缺少 sitemap.xml / robots.txt | 服务器 | ✅ 已创建 |
| 缺少 XSS 防护 | 服务器 | ✅ sanitize-html |
| 缺少安全中间件 (helmet等) | 服务器 | ✅ 已配置 |
| 缺少文章 ToC 目录 | article.html | ✅ 已添加 |
| 缺少阅读进度条 | article.html | ✅ 已添加 |
| 缺少相关文章推荐 | article.html | ✅ 已添加 |
| 缺少 RSS 订阅 | 服务器 | ✅ /feed.xml |
| gallery 内联 CSS/JS | gallery.html | ✅ 已提取 |
| index 内联 CSS | index.html | ⏳ 待提取 |
| articles 内联 CSS/JS | articles.html | ⏳ 待提取 |
| fetch 缺少 catch 处理 | 多个 JS | ✅ 已添加 |
| 图片加载无 fallback | 多个页面 | ⏳ 待修复 |
| API 分页缺 totalPages | articles.js | ✅ 已存在 |
| auth 中间件逻辑重复 | auth.js | ✅ 已去重 |
| 缺少 sort 参数 | articles.js | ✅ 已添加 |
| 静态资源无缓存头 | app.js | ✅ 已添加 |
| 管理后台缺草稿/发布 | admin | ✅ 已添加 |
| 管理后台缺数据导出 | admin | ✅ 已存在 |
| 管理后台缺文章预览 | admin | ✅ 已添加 |
