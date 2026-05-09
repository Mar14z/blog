# 文章列表页规范

## 路由

- 路径：`/articles`
- 入口文件：`articles.html`
- 数据接口：`/api/articles?limit=200`

## 文件引用

| 文件 | 用途 |
|------|------|
| `articles.html` | 文章列表页 HTML 结构 |
| `css/style.css` | 全局样式 |
| `css/articles.css` | 文章列表页专用样式 |
| `js/articles.js` | 文章列表页交互逻辑 |
| `js/api.js` | API 请求封装 |

## 页面结构

### 1. 页面头部

- 区域编号：`02 / 文章`
- 页面标题：`全部文章`
- 标题下方：1px 红色分割线

### 2. 工具栏（Toolbar）

- 左侧：分类筛选按钮组
  - 按钮：`全部` | `编程` | `产品` | `读书` | `设计` | `生活`
  - 当前选中按钮高亮（红色下划线或红色背景）
- 右侧：搜索框
  - 占位符：`搜索文章...`
  - 搜索图标（SVG 放大镜）
  - 防抖处理：300ms

### 3. 文章计数

- 显示格式：`3 / 10 篇`
- 含义：当前筛选结果数 / 总文章数
- 实时更新，随筛选和搜索变化

### 4. 文章列表

- 行布局（row layout），每行包含：
  - 序号（index）：2 位数，如 `01`、`02`，等宽字体
  - 标题 + 摘要（title + excerpt）：标题加粗，摘要灰色小字
  - 分类标签（category tag）：小号标签，红色边框
  - 日期 + 箭头（date + arrow）：日期灰色，箭头默认隐藏
- 行间：1px 分割线

### 5. 分页

- 每页显示：15 篇
- 分页方式：`加载更多` 按钮
- 点击后追加下一批文章到列表
- 无更多文章时按钮隐藏

## 交互逻辑

### 分类筛选

1. 点击分类按钮，切换当前选中分类
2. 选中分类高亮样式
3. 根据选中分类过滤文章列表
4. 选中 `全部` 时显示所有文章
5. 筛选结果实时更新文章计数
6. 筛选与搜索可叠加使用

### 搜索

1. 输入框输入时启动 300ms 防抖计时器
2. 防抖结束后，根据关键词过滤文章标题和摘要
3. 搜索与分类筛选叠加：先按分类过滤，再按关键词过滤
4. 清空搜索框恢复当前分类的全部文章
5. 搜索结果实时更新文章计数

### 文章行 Hover

1. 鼠标悬停时：
   - 左侧出现渐变高亮（从左到右的红色渐变，低透明度）
   - 标题文字变为红色
   - 右侧箭头向右位移出现
2. 鼠标离开时恢复原状
3. 过渡动画：`transition: all 0.3s ease`

### 滚动进入动画

1. 每行文章使用 `IntersectionObserver` 监听
2. 进入视口时触发淡入 + 上移动画
3. 每行延迟递增（stagger），形成瀑布效果
4. 动画参数：`translateY(20px)` → `0`，`opacity: 0` → `1`，`duration: 0.5s`

### 加载更多

1. 点击 `加载更多` 按钮
2. 请求下一页数据
3. 新数据追加到列表末尾
4. 新行同样带滚动进入动画
5. 到达最后一页时隐藏按钮

### 点击跳转

1. 点击文章行跳转到 `/article?slug=xxx`
2. 跳转前可添加微过渡效果

## 样式要点

### 文章行布局

```
| 序号(60px) | 标题+摘要(flex:1) | 分类标签(auto) | 日期+箭头(120px) |
```

- 行高：`80px`
- 内边距：`0 24px`
- 序号：`font-family: "JetBrains Mono"`, `color: #333`
- 标题：`font-size: 18px`, `font-weight: 600`, `color: #f5f5f5`
- 摘要：`font-size: 14px`, `color: #666`, 单行省略
- 分类标签：`font-size: 12px`, `border: 1px solid #e74c3c`, `color: #e74c3c`, `padding: 2px 8px`
- 日期：`font-size: 14px`, `color: #666`
- 箭头：`color: #e74c3c`, 默认 `opacity: 0`, hover 时 `opacity: 1`

### Hover 渐变高亮

```css
.article-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(231, 76, 60, 0.08), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.article-row:hover::before {
  opacity: 1;
}
```

### 工具栏

- 分类按钮：`padding: 6px 16px`, `border: 1px solid #222`, `border-radius: 0`
- 选中状态：`border-color: #e74c3c`, `color: #e74c3c`
- 搜索框：`border: 1px solid #222`, `background: transparent`, `color: #f5f5f5`
- 搜索框获焦：`border-color: #e74c3c`

### 加载更多按钮

- 居中显示
- 样式：`border: 1px solid #333`, `padding: 12px 40px`
- Hover：`border-color: #e74c3c`, `color: #e74c3c`

## 响应式适配

### 桌面端（≥1024px）

- 文章行：完整 4 列布局
- 工具栏：分类按钮横排 + 搜索框右侧

### 平板端（768px - 1023px）

- 文章行：隐藏摘要，保留序号 + 标题 + 分类 + 日期
- 工具栏：分类按钮横排（字号缩小）+ 搜索框下方

### 移动端（<768px）

- 文章行：隐藏序号，只保留标题 + 分类 + 日期
- 分类按钮：横排可滚动（overflow-x: auto）
- 搜索框：独占一行
- 行高缩小至 `60px`
- 日期 + 箭头区域缩窄
