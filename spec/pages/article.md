# 文章详情页规范

## 路由

- 路径：`/article?slug=xxx`
- 入口文件：`article.html`
- 数据接口：`/api/articles?slug=xxx`

## 文件引用

| 文件 | 用途 |
|------|------|
| `article.html` | 文章详情页 HTML 结构 |
| `css/style.css` | 全局样式 |
| `css/article-detail.css` | 文章详情页专用样式 |
| `js/article-detail.js` | 文章详情页交互逻辑 |
| `js/api.js` | API 请求封装 |

## 页面结构

### 1. 文章头部

- 返回按钮：`← 返回`，指向 `/articles`
- 分类标签：红色边框小标签
- 文章标题：大号加粗，最大宽度限制
- 元信息：发布日期 · 阅读时长 · 字数统计
- 1px 分割线

### 2. 文章正文

- Markdown 渲染为 HTML
- 最大宽度：`720px`，居中
- 内容排版：
  - 段落间距：`1.8em`
  - 标题层级：h2/h3/h4，h2 带底部红色短线
  - 代码块：深色背景，等宽字体，行号可选
  - 行内代码：红色边框背景
  - 引用块：左侧红色竖线
  - 图片：圆角，最大宽度 100%，居中
  - 列表：自定义红色圆点
  - 链接：红色，hover 下划线
  - 表格：1px 边框，斑马纹

### 3. 文章底部

- 标签列表：文章关联标签
- 分割线
- 分享按钮组：
  - 复制链接
  - 分享到 Twitter
  - 分享到微博
- 1px 分割线

### 4. 相关文章

- 标题：`相关文章`
- 3 篇相关文章卡片（横排）
- 每张卡片：标题、摘要、日期
- 无相关文章时隐藏此区域

### 5. 页脚

- 版权信息
- 返回顶部按钮

## 交互逻辑

### 页面加载

1. 从 URL 参数获取 `slug`
2. 调用 `/api/articles?slug=xxx` 获取文章数据
3. 渲染文章头部信息
4. 将 Markdown 内容渲染为 HTML 插入正文区域
5. 代码块应用语法高亮
6. 图片添加懒加载
7. 加载相关文章

### 返回按钮

1. 点击 `← 返回` 返回文章列表页
2. 若有 `document.referrer` 且同源，使用 `history.back()`
3. 否则跳转 `/articles`

### 分享功能

1. **复制链接**：
   - 点击复制按钮
   - 使用 `navigator.clipboard.writeText()` 复制当前页面 URL
   - 按钮文字临时变为 `已复制!`
   - 2 秒后恢复原文字
   - 降级方案：`document.execCommand('copy')`

2. **分享到 Twitter**：
   - 构造 URL：`https://twitter.com/intent/tweet?text={标题}&url={链接}`
   - `window.open()` 打开新窗口

3. **分享到微博**：
   - 构造 URL：`https://service.weibo.com/share/share.php?title={标题}&url={链接}`
   - `window.open()` 打开新窗口

### 相关文章

1. 根据当前文章的分类和标签匹配相关文章
2. 排除当前文章本身
3. 最多显示 3 篇
4. 点击跳转对应文章详情页

### 目录导航（可选）

1. 解析文章正文中所有 h2/h3 标题
2. 生成目录列表
3. 滚动时高亮当前所在标题
4. 点击目录项平滑滚动到对应位置

### 滚动行为

1. 页面滚动时，文章头部信息可固定在顶部（sticky）
2. 返回顶部按钮在滚动超过一屏后显示
3. 点击返回顶部，`scrollTo({ top: 0, behavior: 'smooth' })`

## 样式要点

### 文章头部

- 标题：`font-size: 36px`, `font-weight: 700`, `line-height: 1.4`
- 元信息：`font-size: 14px`, `color: #666`
- 分类标签：`font-size: 12px`, `border: 1px solid #e74c3c`, `color: #e74c3c`

### 正文排版

- 字体：`"Noto Serif SC", serif`
- 字号：`18px`
- 行高：`1.8`
- 颜色：`#d4d4d4`
- 最大宽度：`720px`

### 代码块

- 背景：`#1a1a1a`
- 字体：`"JetBrains Mono", monospace`
- 字号：`14px`
- 圆角：`4px`
- 内边距：`16px 20px`
- 溢出：`overflow-x: auto`

### 引用块

- 左侧：`3px solid #e74c3c`
- 内边距：`12px 20px`
- 背景：`rgba(231, 76, 60, 0.05)`
- 斜体

### 图片

- 圆角：`4px`
- 最大宽度：`100%`
- 居中：`margin: 24px auto`

### 分享按钮

- 圆形图标按钮
- 边框：`1px solid #333`
- Hover：`border-color: #e74c3c`, `color: #e74c3c`

### 相关文章卡片

- 背景：`#151515`
- 边框：`1px solid #222`
- Hover：`border-color: #e74c3c`, 微上移
- 标题：`font-size: 16px`, `font-weight: 600`

## 响应式适配

### 桌面端（≥1024px）

- 正文最大宽度 `720px` 居中
- 相关文章：3 列网格
- 分享按钮横排

### 平板端（768px - 1023px）

- 正文最大宽度 `90%`
- 相关文章：2 列网格
- 分享按钮横排

### 移动端（<768px）

- 标题字号缩小至 `24px`
- 正文字号缩小至 `16px`
- 正文宽度 `100%`，内边距 `20px`
- 相关文章：1 列堆叠
- 分享按钮横排但间距缩小
- 代码块字号 `12px`
