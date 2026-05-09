# 静墨博客 - 组件规范

## CSS 组件 (components.css)

### 导航栏 (.nav)

| 属性 | 值 |
|------|-----|
| position | fixed |
| top | 0 |
| padding | 1.5rem 4rem |
| display | flex |
| justify-content | space-between |
| z-index | 1000 |

```css
.nav {
  position: fixed;
  top: 0;
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  z-index: 1000;
}
```

#### 导航栏左侧 (.nav-left)

| 属性 | 值 |
|------|-----|
| display | flex |
| align-items | center |

#### Logo (.logo)

| 属性 | 值 |
|------|-----|
| font-family | var(--font-sans) |
| font-size | 1.75rem |
| font-weight | 700 |

#### 导航链接 (.nav-link)

| 属性 | 值 |
|------|-----|
| font-family | var(--font-mono) |
| font-size | 0.95rem |
| text-transform | uppercase |
| letter-spacing | 2px |
| hover/active color | var(--accent) |

```css
.nav-link:hover,
.nav-link.active {
  color: var(--accent);
}
```

---

### 阅读进度条 (.nav-progress)

| 属性 | 值 |
|------|-----|
| position | fixed |
| top | 0 |
| height | 2px |
| background | var(--accent) |
| z-index | 1001 |

```css
.nav-progress {
  position: fixed;
  top: 0;
  height: 2px;
  background: var(--accent);
  z-index: 1001;
}
```

---

### 页脚 (.footer)

| 属性 | 值 |
|------|-----|
| padding | 2rem 4rem |
| border-top | 1px solid var(--border) |
| display | flex |
| justify-content | space-between |

```css
.footer {
  padding: 2rem 4rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
}
```

#### 页脚文本 (.footer-text)

| 属性 | 值 |
|------|-----|
| font-family | var(--font-mono) |
| font-size | 0.65rem |
| color | var(--text-muted) |

#### 页脚链接 (.footer-link)

| 属性 | 值 |
|------|-----|
| font-family | var(--font-mono) |
| font-size | 0.65rem |
| hover color | var(--accent) |

```css
.footer-link:hover {
  color: var(--accent);
}
```

---

### 提示消息 (.toast)

| 属性 | 值 |
|------|-----|
| position | fixed |
| bottom | 2rem |
| right | 2rem |
| z-index | 2000 |

```css
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 2000;
}
```

---

### 筛选按钮 (.filter-btn)

| 属性 | 值 |
|------|-----|
| font-family | var(--font-mono) |
| font-size | 0.7rem |
| border | 1px solid var(--border) |

#### 筛选按钮状态

| 状态 | 样式 |
|------|------|
| hover / active | background: var(--text-primary); color: var(--bg-primary) |

```css
.filter-btn:hover,
.filter-btn.active {
  background: var(--text-primary);
  color: var(--bg-primary);
}
```

---

### 页面布局组件

| 类名 | 说明 |
|------|------|
| `.page-content` | 页面内容容器 |
| `.page-header` | 页面头部区域 |
| `.page-title` | 页面标题 |
| `.page-subtitle` | 页面副标题 |

---

## JS 工具函数 (utils.js)

### 常量

| 名称 | 值 | 说明 |
|------|-----|------|
| `API_BASE` | `protocol + hostname + :3001/api` | API 基础地址 |

### 函数列表

| 函数 | 参数 | 说明 |
|------|------|------|
| `debounce(fn, delay)` | fn: Function, delay: number | 防抖函数，延迟执行 |
| `throttle(fn, delay)` | fn: Function, delay: number | 节流函数，固定间隔执行 |
| `showToast(message, type)` | message: string, type: 'success' \| 'error' \| 'info' | 显示提示消息 |
| `formatDate(dateStr)` | dateStr: string | 格式化日期（简短格式） |
| `formatDateFull(dateStr)` | dateStr: string | 格式化日期（完整格式） |
| `toSlug(text)` | text: string | 将文本转换为 URL slug |
| `isValidUrl(string)` | string: string | 验证是否为合法 URL |
| `createScrollObserver(callback, options)` | callback: Function, options: object | 创建滚动观察器 |
| `observeElements(selector, callback)` | selector: string, callback: Function | 观察指定选择器元素进入视口 |

---

## 页面 JS 模块

### 首页 (app.js) - BlogApp 类

| 方法 | 说明 |
|------|------|
| `loadArticles(limit=7)` | 加载文章列表，默认 7 篇 |
| `renderFeatured()` | 渲染推荐文章 |
| `renderArticles()` | 渲染文章列表（跳过第 1 篇，取第 2-7 篇） |

#### 首页功能

- 滚动进度条
- 联系表单提交
- 时间线滚动动画观察器

---

### 文章详情页 (article-detail.js) - ArticleDetail 类

| 方法 | 说明 |
|------|------|
| `loadArticle(slug)` | 根据 slug 加载文章 |
| `renderContent()` | 渲染文章内容 |
| 分享按钮 | 社交平台分享功能 |
| 复制链接 | 复制当前页面链接到剪贴板 |

---

### 作品集页 (portfolio.js) - PortfolioPage 类

| 方法 | 说明 |
|------|------|
| `filterByCategory(category)` | 按分类筛选作品 |

---

### 友链页 (links.js) - LinksPage 类

- 友情链接列表渲染与交互

---

### 关于页 (about.js) - AboutPage 类

- 个人信息展示
- 时间线/经历展示

---

## 组件依赖关系

```
utils.js (公共基础)
    ├── app.js (首页)
    ├── article-detail.js (文章详情)
    ├── portfolio.js (作品集)
    ├── links.js (友链)
    └── about.js (关于)

components.css (公共样式)
    ├── about.css
    ├── links.css
    ├── pages.css
    └── portfolio.css
```

---

## 组件交互规范

### Toast 消息

- 调用方式：`showToast(message, type)`
- type 可选值：`'success'`、`'error'`、`'info'`
- 自动消失时间：3 秒
- 位置：右下角固定定位

### 筛选按钮

- 点击切换 `.active` 类名
- 同组按钮互斥，同时只有一个 `.active`
- 切换时触发对应过滤逻辑

### 滚动观察器

- 使用 `IntersectionObserver` API
- 通过 `observeElements(selector, callback)` 统一管理
- 元素进入视口时添加动画类名

### API 请求

- 所有请求通过 `API_BASE` 拼接完整 URL
- 需要认证的接口在请求头中携带 `Authorization: Bearer <token>`
- 统一处理错误响应，失败时调用 `showToast` 提示
