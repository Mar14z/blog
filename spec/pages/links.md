# 友链页规范

## 路由

- 路径：`/links`
- 入口文件：`links.html`
- 数据接口：`/api/links`

## 文件引用

| 文件 | 用途 |
|------|------|
| `links.html` | 友链页 HTML 结构 |
| `css/style.css` | 全局样式 |
| `css/links.css` | 友链页专用样式 |
| `js/links.js` | 友链页交互逻辑 |
| `js/api.js` | API 请求封装 |

## 页面结构

### 1. 页面头部

- 区域编号：`05 / 友链`
- 页面标题：`友情链接`
- 副标题：`互联网上的邻居们`
- 标题下方：1px 红色分割线

### 2. 友链分组

- 按分类分组展示
- 分组类别：
  - `技术博客`
  - `设计创意`
  - `生活随笔`
  - `其他`
- 每个分组有标题

### 3. 友链卡片

- 每张卡片包含：
  - 头像（avatar）
  - 名称（name）
  - 描述（description）
  - 链接（URL → jingmo.dev 域名）
- 卡片网格布局

### 4. 申请友链说明

- 标题：`申请友链`
- 说明文字：友链申请要求与流程
- 联系方式

### 5. 页脚

- 版权信息：`© 2024 静墨`

## 交互逻辑

### 页面加载

1. 调用 `/api/links` 获取友链数据
2. 按分类分组渲染
3. 占位 URL 替换为 `jingmo.dev` 域名

### 友链卡片 Hover

1. 鼠标悬停时：
   - 卡片微上移（`translateY(-4px)`）
   - 边框颜色变红
   - 头像微放大
2. 鼠标离开时恢复原状
3. 过渡动画：`transition: all 0.3s ease`

### 点击跳转

1. 点击卡片在新标签页打开友链网站
2. `target="_blank"`, `rel="noopener noreferrer"`

### 滚动进入动画

1. 友链卡片使用 `IntersectionObserver` 监听
2. 进入视口时触发淡入 + 上移动画
3. 每张卡片延迟递增（stagger）
4. 动画参数：`translateY(20px)` → `0`, `opacity: 0` → `1`

### 头像加载

1. 头像使用懒加载
2. 加载失败时显示默认占位头像
3. `onerror` 处理：替换为默认头像 SVG

## 样式要点

### 分组标题

- `font-size: 18px`, `font-weight: 600`
- 左侧红色竖线装饰：`3px solid #e74c3c`, `padding-left: 12px`
- 下方间距：`24px`

### 友链卡片

```css
.link-card {
  background: #151515;
  border: 1px solid #222;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
}
.link-card:hover {
  transform: translateY(-4px);
  border-color: #e74c3c;
}
```

### 头像

```css
.link-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #333;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
.link-card:hover .link-avatar {
  transform: scale(1.1);
}
```

### 卡片文字

- 名称：`font-size: 16px`, `font-weight: 600`, `color: #f5f5f5`
- 描述：`font-size: 14px`, `color: #888`, `line-height: 1.5`
- 描述单行省略：`text-overflow: ellipsis`, `white-space: nowrap`, `overflow: hidden`

### 申请友链区域

- 背景：`#111111`
- 边框：`1px solid #222`
- 内边距：`32px`
- 标题：`font-size: 18px`, `font-weight: 600`
- 说明文字：`font-size: 14px`, `color: #888`, `line-height: 1.8`

### 网格布局

```css
.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
```

## 响应式适配

### 桌面端（≥1024px）

- 友链网格：2 列
- 卡片横排布局（头像 + 文字）

### 平板端（768px - 1023px）

- 友链网格：2 列
- 卡片横排布局（缩小间距）

### 移动端（<768px）

- 友链网格：1 列
- 卡片横排布局（头像缩小至 `40px`）
- 申请友链区域内边距缩小至 `20px`
- 分组间距缩小至 `32px`
