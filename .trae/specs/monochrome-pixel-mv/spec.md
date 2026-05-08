# 纯黑白像素 MV 风格界面 Spec

## Why
打造一个极具沉浸感的黑白像素艺术风格博客，让浏览体验如同观看一部精心编排的视觉艺术短片。

## What Changes
- 全站采用近乎纯黑白配色，去除所有彩色元素
- 首页像素风格横幅配合 3D 旋转字母动画
- 类似 MV 的沉浸式滚动体验，每屏一个完整场景
- 保持所有原有功能（文章、搜索、导航）

## Impact
- Affected specs: 原有极简风格博客
- Affected code: styles.css, index.html, script.js, article.html

## Design Language

### 配色方案（纯黑白）
```
--bg-primary: #000000        /* 纯黑背景 */
--bg-secondary: #0a0a0a      /* 微调黑 */
--bg-tertiary: #111111       /* 卡片背景 */
--bg-card: #1a1a1a           /* 卡片悬停 */
--border: #2a2a2a            /* 边框 */
--text-primary: #ffffff       /* 主文字 */
--text-secondary: #888888     /* 次要文字 */
--text-dim: #444444          /* 暗淡文字 */
--accent: #ffffff            /* 高亮白色 */
```

### 字体
- 标题: **Press Start 2P** (像素字体)
- 正文: **JetBrains Mono** (等宽字体，单色友好)

### 视觉特效
- 3D 空间旋转字母环绕横幅
- CRT 扫描线效果（单色）
- 全屏场景切换动画
- 视差滚动效果
- 渐入渐出文字动画

## Page Structure

### 首页场景流程
1. **Hero Scene** - 全屏横幅 + 3D 旋转字母 + 标题文字
2. **Articles Scene** - 竖向滑动展示文章网格
3. **About Scene** - 简洁自我介绍
4. **Contact Scene** - 联系方式表单

### 滚动行为
- 页面被分割为多个全屏 "场景"
- 每个场景滚动触发进入动画
- 平滑的 section snap 效果
- 进度指示器

## Animation Specifications

### 3D 旋转字母
- 26 个英文字母在 3D 空间围绕标题旋转
- 每个字母大小、深度、旋转速度随机
- 使用 CSS 3D transforms
- 持续旋转，可被用户滚动打断

### 场景切换动画
- 当前场景淡出 (opacity 0, translateY -50px)
- 下一场景淡入 (opacity 1, translateY 0)
- 过渡时长: 600ms
- 缓动函数: cubic-bezier(0.4, 0, 0.2, 1)

### 文字动画
- 标题逐字显示 (letter-by-letter reveal)
- 悬停时轻微放大 (scale 1.05)
- 链接下划线从左到右填充

## Component Specifications

### Navigation
- 固定顶部，高度 60px
- 透明背景，滚动后变黑
- Logo + 导航链接
- 滚动进度条（白色细线）

### Article Cards
- 黑白渐变背景
- 悬停时边框发光（白色）
- 简洁的元信息显示

### Scene Sections
- 100vh 高度
- Flex 居中布局
- 进入动画触发

## Technical Approach
- 纯 CSS + Vanilla JS 实现
- Intersection Observer API 触发场景动画
- CSS scroll-snap 实现分段滚动
- requestAnimationFrame 优化 3D 动画
