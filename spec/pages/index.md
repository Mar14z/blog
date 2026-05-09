# 首页规范

## 路由

- 路径：`/`
- 入口文件：`index.html`
- 数据接口：`/api/articles?limit=7`

## 文件引用

| 文件 | 用途 |
|------|------|
| `index.html` | 首页 HTML 结构 |
| `css/style.css` | 全局样式与首页样式 |
| `js/main.js` | 首页交互逻辑 |
| `js/api.js` | API 请求封装 |

## 页面结构

### 1. Hero 区域

- 占满整个视口（100vh）
- 网格背景（grid background），中心径向遮罩（radial mask）渐隐
- 标签文字：`静墨 / 博客`，小号字体，字间距拉大
- 主标题：`记录 · 思考 · 沉淀`，大号加粗
- 副标题：带闪烁光标（blinking cursor）的动态文字
- 底部滚动指示器：向下箭头 + `SCROLL` 文字，带上下浮动动画

### 2. Marquee 跑马灯

- 无限循环滚动的技术标签（如 JavaScript、React、Node.js、CSS、TypeScript 等）
- 标签之间用红色圆点（red dot）分隔
- 动画周期：40s，线性匀速
- 鼠标悬停暂停滚动
- 双行反向滚动（一行从左到右，一行从右到左）

### 3. Quick Nav 快捷导航

- 4 张卡片，1px 间隙网格布局
- 卡片内容：
  - SVG 图标
  - 标签文字（label）
  - 标题（title）
  - 描述（desc）
  - 右箭头指示
- 四个导航项：

| 标签 | 标题 | 描述 | 跳转 |
|------|------|------|------|
| 相册 | Gallery | 光影记录 | `/gallery` |
| 作品集 | Portfolio | 项目展示 | `/portfolio` |
| 关于 | About | 了解更多 | `/about` |
| 友链 | Links | 互联网邻居 | `/links` |

### 4. Articles 文章区域

- 区域编号：`02`
- 区域标题：`文章`
- 头部右侧：`查看全部 →` 链接，指向 `/articles`
- 精选文章：2 列大卡片布局
  - 左侧：大号序号 `01`
  - 右侧：文章标题、摘要、分类标签、日期
- 文章网格：最多 6 篇文章卡片
  - 每张卡片：标题、摘要、分类标签、日期
- 底部：`浏览全部文章` 按钮，指向 `/articles`

### 5. About 关于区域

- 2 列布局
- 左列：
  - 个人介绍文字
  - 统计数据（文章数、项目数、经验年限等）
- 右列：
  - 引用文字：`少即是多，但少必须精准`
  - 引用作者：`密斯·凡·德·罗`
  - 标签云（设计、极简、代码等关键词标签）

### 6. Timeline 时间线

- 4 个时间节点
- 每个节点：红色圆点 + 时间 + 事件描述
- 滚动进入动画（scroll-in animation）
- 竖线连接各节点

### 7. Contact 联系区域

- 2 列布局
- 左列：
  - 联系信息文字
  - Email 渠道
  - GitHub 渠道
- 右列：
  - 浮动标签表单（floating-label form）
  - 字段：姓名、邮箱、消息
  - 提交按钮

### 8. Footer 页脚

- 版权信息：`© 2024 静墨`
- 社交链接
- 备案号（如适用）

## 交互逻辑

### Hero 区域

1. 页面加载后，标题文字逐字淡入
2. 副标题打字机效果，光标持续闪烁（CSS animation, 1s step-end infinite）
3. 滚动指示器：`transform: translateY()` 上下浮动，1.5s ease-in-out infinite

### Marquee 跑马灯

1. 使用 CSS `@keyframes` 实现无限滚动
2. `animation-duration: 40s`
3. `animation-timing-function: linear`
4. 鼠标悬停：`animation-play-state: paused`

### Quick Nav

1. 卡片 hover：整体微上移 + 边框颜色变红 + 箭头右移
2. 点击跳转对应页面

### Articles

1. 页面加载时调用 `/api/articles?limit=7` 获取文章数据
2. 第一篇作为精选文章渲染为大卡片
3. 其余 6 篇渲染为网格卡片
4. 卡片 hover：标题变红 + 微上移 + 阴影加深
5. 滚动进入动画：`IntersectionObserver` 触发淡入上移

### Timeline

1. `IntersectionObserver` 监听每个时间节点
2. 进入视口时添加 `.visible` 类，触发 CSS 过渡动画
3. 动画效果：从左侧滑入 + 淡入

### Contact 表单

1. 浮动标签：输入框获焦/有值时标签上移缩小
2. 表单验证：邮箱格式校验、必填项校验
3. 提交后显示成功提示

## 样式要点

### 配色

| 用途 | 色值 |
|------|------|
| 主背景 | `#0a0a0a` |
| 次背景 | `#111111` |
| 主文字 | `#f5f5f5` |
| 次文字 | `#a0a0a0` |
| 强调色 | `#e74c3c`（红） |
| 边框 | `#222222` |
| 卡片背景 | `#151515` |

### 字体

- 标题：`"Noto Serif SC", serif`
- 正文：`"Noto Sans SC", sans-serif`
- 代码/标签：`"JetBrains Mono", monospace`

### 间距

- 区域之间：`120px` 间距
- 区域内边距：`80px` 上下，`max-width: 1200px` 居中
- 卡片内边距：`24px`
- 网格间隙：`1px`（Quick Nav）

### 动画

- 统一过渡：`transition: all 0.3s ease`
- 滚动进入：`transform: translateY(30px)` → `translateY(0)`，`opacity: 0` → `1`
- 红色强调元素：hover 时 `scale(1.05)`

## 响应式适配

### 桌面端（≥1024px）

- Quick Nav：4 列网格
- Articles：3 列网格
- About / Contact：2 列布局
- Timeline：左侧时间 + 右侧内容

### 平板端（768px - 1023px）

- Quick Nav：2 列网格
- Articles：2 列网格
- About / Contact：2 列布局（缩小间距）
- Timeline：左侧时间 + 右侧内容

### 移动端（<768px）

- Hero：标题字号缩小 30%
- Quick Nav：1 列堆叠
- Articles：1 列堆叠，精选文章改为单列
- About / Contact：1 列堆叠
- Timeline：顶部时间 + 下方内容
- Marquee：标签字号缩小，动画周期缩短至 25s
- 区域间距：`60px`
- 内边距：`20px`
