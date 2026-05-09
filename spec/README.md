# 静墨博客 — 项目规范索引

| 字段 | 值 |
|------|------|
| 项目名称 | 静墨博客 (JingMo Blog) |
| 版本 | 1.0.0 |
| 最后更新 | 2026-05-10 |
| 技术栈 | Node.js + Express + MongoDB |

---

## 规范文件结构

```
spec/
├── README.md           # 本文件 - 规范索引
├── design-system.md    # 设计系统（色彩/字体/间距/动画/断点）
├── pages/              # 各页面详细规范
│   ├── index.md        # 首页
│   ├── articles.md     # 文章列表页
│   ├── article.md      # 文章详情页
│   ├── gallery.md      # 相册页
│   ├── portfolio.md    # 作品集页
│   ├── about.md        # 关于页
│   ├── links.md        # 友链页
│   └── admin.md        # 管理后台
├── api.md              # API 接口规范
├── architecture.md     # 技术架构与文件结构
├── components.md       # 组件规范（CSS/JS）
├── performance.md      # 性能优化规范
├── accessibility.md    # 可访问性与 SEO
└── changelog.md        # 更新日志与待办
```

---

## 文件说明

| 文件 | 说明 |
|------|------|
| [design-system.md](design-system.md) | 设计系统完整规范：色彩变量、字体层级、间距体系、动画曲线、响应式断点及全局样式规则 |
| pages/index.md | 首页布局、Hero 区域、快速导航、最新文章展示等规范 |
| pages/articles.md | 文章列表页网格布局、筛选/排序、分页逻辑等规范 |
| pages/article.md | 文章详情页排版、目录、代码高亮、评论等规范 |
| pages/gallery.md | 相册页瀑布流/网格布局、灯箱交互、图片懒加载等规范 |
| pages/portfolio.md | 作品集页项目卡片、筛选分类、详情弹窗等规范 |
| pages/about.md | 关于页个人信息展示、时间线、技能标签等规范 |
| pages/links.md | 友链页卡片布局、分类、申请流程等规范 |
| pages/admin.md | 管理后台登录、文章 CRUD、图片上传、数据统计等规范 |
| [api.md](api.md) | RESTful API 接口定义：路由、请求/响应格式、认证方式、错误码 |
| [architecture.md](architecture.md) | 技术架构设计：目录结构、模块划分、数据模型、中间件链路 |
| [components.md](components.md) | 可复用组件规范：导航栏、卡片、按钮、模态框等 CSS/JS 实现 |
| [performance.md](performance.md) | 性能优化策略：资源加载、图片优化、缓存策略、关键渲染路径 |
| [accessibility.md](accessibility.md) | 可访问性标准：ARIA 标签、键盘导航、语义化 HTML、SEO 元数据 |
| [changelog.md](changelog.md) | 版本更新日志、待办事项、已知问题追踪 |

---

## 约定

- 所有规范文件使用 Markdown 格式编写
- 代码示例使用对应语言的代码块标记
- 颜色值统一使用 CSS 自定义属性引用
- 断点以移动优先（Mobile First）为原则
- 新增或修改规范后，请同步更新本索引文件的「最后更新」日期
