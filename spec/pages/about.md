# 关于页规范

## 路由

- 路径：`/about`
- 入口文件：`about.html`
- 数据接口：无（静态页面）

## 文件引用

| 文件 | 用途 |
|------|------|
| `about.html` | 关于页 HTML 结构 |
| `css/style.css` | 全局样式 |
| `css/about.css` | 关于页专用样式 |
| `js/about.js` | 关于页交互逻辑 |

## 页面结构

### 1. 页面头部

- 区域编号：`04 / 关于`
- 页面标题：`关于我`
- 标题下方：1px 红色分割线

### 2. 个人信息区

- 头像（圆形或方形带边框）
- 姓名
- 一句话介绍
- 社交链接图标（GitHub、邮箱等）

### 3. 教育背景

- 标题：`教育背景`
- 时间线布局：
  - 学校名称
  - 专业 / 学位
  - 时间段
  - 简要描述（可选）

### 4. 数字技能

- 标题：`数字技能`
- 技能分类展示：
  - 前端：HTML / CSS / JavaScript / React / Vue 等
  - 后端：Node.js / Python / 数据库等
  - 工具：Git / Docker / Figma 等
- 每项技能：名称 + 熟练度指示（进度条或标签）

### 5. 软技能

- 标题：`软技能`
- 标签云形式展示：
  - 团队协作
  - 项目管理
  - 沟通表达
  - 问题解决
  - 持续学习
  - 等等

### 6. 工作经历

- 标题：`工作经历`
- 时间线布局：
  - 公司名称
  - 职位
  - 时间段
  - 工作内容描述
  - 使用技术标签

### 7. 联系方式

- 标题：`联系方式`
- 内容：
  - 邮箱地址
  - GitHub 链接
  - 其他社交链接
- 可点击跳转

### 8. 页脚

- 版权信息：`© 2024 静墨`

## 交互逻辑

### 页面加载

1. 静态内容直接渲染
2. 各区域使用 `IntersectionObserver` 监听
3. 进入视口时触发滚动进入动画

### 技能进度条

1. 进入视口时进度条从 0 动画到目标值
2. 动画时长：`1s`
3. 缓动：`ease-out`

### 软技能标签

1. 进入视口时标签依次淡入
2. 每个标签延迟递增（stagger）
3. 动画：`scale(0.8)` → `scale(1)`, `opacity: 0` → `1`

### 时间线

1. 教育背景和工作经历使用统一时间线组件
2. 每个节点滚动进入时从左/右交替滑入
3. 红色圆点标记时间节点

### 社交链接

1. Hover 时图标变色（红色）+ 微放大
2. 点击在新标签页打开链接

## 样式要点

### 个人信息区

- 头像：`120×120px`, `border: 2px solid #333`, 圆角 `4px`
- 姓名：`font-size: 28px`, `font-weight: 700`
- 介绍：`font-size: 16px`, `color: #888`

### 区域标题

- `font-size: 20px`, `font-weight: 600`
- 左侧红色竖线装饰：`3px solid #e74c3c`, `padding-left: 12px`
- 下方间距：`32px`

### 时间线

```css
.timeline {
  position: relative;
  padding-left: 32px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #222;
}
.timeline-item {
  position: relative;
  margin-bottom: 32px;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -36px;
  top: 6px;
  width: 8px;
  height: 8px;
  background: #e74c3c;
  border-radius: 50%;
}
```

### 技能进度条

```css
.skill-bar {
  height: 4px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
}
.skill-bar-fill {
  height: 100%;
  background: #e74c3c;
  transition: width 1s ease-out;
}
```

### 软技能标签

```css
.soft-skill-tag {
  display: inline-block;
  padding: 6px 16px;
  border: 1px solid #333;
  color: #a0a0a0;
  font-size: 14px;
  transition: all 0.3s ease;
}
.soft-skill-tag:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}
```

### 联系方式

- 图标 + 文字横排
- 图标：`20×20px` SVG
- 文字：`color: #a0a0a0`, hover 变红

## 响应式适配

### 桌面端（≥1024px）

- 个人信息区：头像 + 文字横排
- 技能区：2 列网格（前端 / 后端）
- 时间线：左侧时间 + 右侧内容

### 平板端（768px - 1023px）

- 个人信息区：头像 + 文字横排（缩小间距）
- 技能区：2 列网格
- 时间线：左侧时间 + 右侧内容

### 移动端（<768px）

- 个人信息区：头像居上 + 文字居下
- 技能区：1 列堆叠
- 时间线：顶部时间 + 下方内容
- 区域间距缩小至 `40px`
- 内边距：`20px`
