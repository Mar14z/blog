# 作品集页规范

## 路由

- 路径：`/portfolio`
- 入口文件：`portfolio.html`
- 数据接口：`/api/portfolio`

## 文件引用

| 文件 | 用途 |
|------|------|
| `portfolio.html` | 作品集页 HTML 结构 |
| `css/style.css` | 全局样式 |
| `css/portfolio.css` | 作品集页专用样式 |
| `js/portfolio.js` | 作品集页交互逻辑 |
| `js/api.js` | API 请求封装 |

## 页面结构

### 1. 页面头部

- 区域编号：`03 / 作品`
- 页面标题：`作品集`
- 标题下方：1px 红色分割线

### 2. 筛选栏

- 分类筛选按钮组
- 按钮：`全部` | `网站` | `应用` | `设计` | `开源` | `其他`
- 当前选中按钮高亮（红色下划线或红色边框）

### 3. 项目网格

- 响应式网格布局
- 项目卡片内容：
  - 封面图 / 预览图
  - 项目标题
  - 项目描述（1-2 行）
  - 技术标签（tags）
  - 链接按钮（在线预览 / 源码）

### 4. 页脚

- 版权信息：`© 2024 静墨`

## 交互逻辑

### 分类筛选

1. 点击分类按钮切换当前分类
2. 选中分类高亮样式
3. 项目卡片根据分类过滤显示/隐藏
4. 选中 `全部` 时显示所有项目
5. 过滤动画：隐藏项淡出 + 缩小，显示项淡入 + 放大
6. 使用 CSS `transition` 实现平滑过渡
7. 过渡结束后隐藏项设置 `display: none`

### 项目卡片 Hover

1. 鼠标悬停时：
   - 卡片微上移（`translateY(-4px)`）
   - 阴影加深
   - 封面图微放大（`scale(1.05)`）
   - 链接按钮从底部滑入显示
2. 鼠标离开时恢复原状
3. 过渡动画：`transition: all 0.3s ease`

### 链接按钮

1. **在线预览**：点击在新标签页打开项目链接
2. **源码**：点击在新标签页打开 GitHub 仓库
3. 无对应链接时隐藏对应按钮

### 滚动进入动画

1. 项目卡片使用 `IntersectionObserver` 监听
2. 进入视口时触发淡入 + 上移动画
3. 每张卡片延迟递增（stagger），形成瀑布效果
4. 动画参数：`translateY(30px)` → `0`，`opacity: 0` → `1`

### 页面加载

1. 调用 `/api/portfolio` 获取项目数据
2. 渲染项目卡片到网格
3. 默认选中 `全部` 分类

## 样式要点

### 筛选栏

- 按钮样式：`padding: 6px 16px`, `border: 1px solid #222`, `background: transparent`
- 选中状态：`border-color: #e74c3c`, `color: #e74c3c`
- 按钮间距：`8px`
- 过渡：`transition: all 0.3s ease`

### 项目卡片

```css
.project-card {
  background: #151515;
  border: 1px solid #222;
  border-radius: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}
.project-card:hover {
  transform: translateY(-4px);
  border-color: #333;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
```

### 封面图

```css
.project-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.project-card:hover .project-cover {
  transform: scale(1.05);
}
```

### 卡片内容

- 内边距：`20px`
- 标题：`font-size: 18px`, `font-weight: 600`, `color: #f5f5f5`
- 描述：`font-size: 14px`, `color: #888`, `line-height: 1.6`
- 标签：`font-size: 12px`, `border: 1px solid #333`, `color: #888`, `padding: 2px 8px`

### 链接按钮

- 默认隐藏：`opacity: 0`, `transform: translateY(10px)`
- Hover 显示：`opacity: 1`, `transform: translateY(0)`
- 样式：`border: 1px solid #e74c3c`, `color: #e74c3c`, `padding: 6px 16px`
- Hover：`background: #e74c3c`, `color: #fff`

### 网格布局

```css
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

## 响应式适配

### 桌面端（≥1024px）

- 项目网格：3 列
- 筛选按钮横排

### 平板端（768px - 1023px）

- 项目网格：2 列
- 筛选按钮横排（字号缩小）

### 移动端（<768px）

- 项目网格：1 列
- 筛选按钮横排可滚动（overflow-x: auto）
- 卡片内容内边距缩小至 `16px`
- 封面图 aspect-ratio 调整为 `4 / 3`
