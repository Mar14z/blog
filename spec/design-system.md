# 设计系统

静墨博客的完整设计系统规范，涵盖色彩、字体、间距、动画、断点及全局样式规则。

---

## 1. 色彩系统

### 1.1 CSS 自定义属性

```css
:root {
    --bg-primary: #000000;
    --bg-secondary: #0a0a0a;
    --bg-tertiary: #111111;
    --bg-card: #1a1a1a;

    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.6);
    --text-muted: rgba(255, 255, 255, 0.4);
    --text-dim: rgba(255, 255, 255, 0.3);

    --accent: #D32F2F;
    --accent-hover: #B71C1C;

    --border: rgba(255, 255, 255, 0.1);
    --border-hover: rgba(255, 255, 255, 0.2);
}
```

### 1.2 色彩语义说明

| 变量 | 值 | 用途 |
|------|------|------|
| `--bg-primary` | `#000000` | 页面主背景，最深层底色 |
| `--bg-secondary` | `#0a0a0a` | 次级背景，导航栏、页脚等区域 |
| `--bg-tertiary` | `#111111` | 第三层背景，区块分隔区域 |
| `--bg-card` | `#1a1a1a` | 卡片/容器背景，与主背景形成层次 |
| `--text-primary` | `#ffffff` | 主文本，标题与重要内容 |
| `--text-secondary` | `rgba(255,255,255,0.6)` | 次级文本，描述与辅助信息 |
| `--text-muted` | `rgba(255,255,255,0.4)` | 弱化文本，标签与时间戳 |
| `--text-dim` | `rgba(255,255,255,0.3)` | 最弱文本，占位符与禁用态 |
| `--accent` | `#D32F2F` | 强调色，链接、按钮、高亮标记 |
| `--accent-hover` | `#B71C1C` | 强调色悬停态，交互反馈 |
| `--border` | `rgba(255,255,255,0.1)` | 默认边框，分隔线 |
| `--border-hover` | `rgba(255,255,255,0.2)` | 边框悬停态，交互反馈 |

### 1.3 色彩使用原则

- **黑-白-红三色体系**：整体视觉以黑底白字为基调，红色仅作为强调与交互反馈
- 强调色不可大面积使用，仅用于关键交互元素（链接、按钮、活跃状态标记）
- 背景层次通过极微妙的灰度差异（`#000` → `#0a0a0a` → `#111` → `#1a1a1a`）实现纵深感
- 文本层次通过透明度递减（`1.0` → `0.6` → `0.4` → `0.3`）建立信息层级
- 禁止引入上述变量以外的色彩，保持极简克制

---

## 2. 字体系统

### 2.1 字体族定义

```css
:root {
    --font-mono: 'JetBrains Mono', monospace;
    --font-sans: 'Noto Sans SC', sans-serif;
}
```

| 变量 | 字体 | 用途 |
|------|------|------|
| `--font-mono` | JetBrains Mono | 标签、数字、代码、导航链接、技术性文本 |
| `--font-sans` | Noto Sans SC | 标题、正文、中文内容 |

### 2.2 字体层级规范

| 元素 | 字号 | 字重 | 字体族 | 其他 |
|------|------|------|--------|------|
| 导航 Logo | 1.75rem | 700 | var(--font-sans) | — |
| 导航链接 | 0.95rem | — | var(--font-mono) | uppercase, letter-spacing: 2px |
| 页面标题 | clamp(2.5rem, 6vw, 4rem) | 900 | var(--font-sans) | 响应式缩放 |
| 区块编号 | 0.7rem | — | var(--font-mono) | color: var(--accent), letter-spacing: 4px |
| 正文文本 | 0.875rem–0.95rem | 400 | var(--font-sans) | 行高 1.6–1.8 |
| Mono 标签 | 0.6rem–0.75rem | — | var(--font-mono) | 标签、分类、时间戳 |

### 2.3 字体使用原则

- 导航链接强制大写 + 等宽字体 + 字间距，营造技术感与秩序感
- 页面标题使用 `clamp()` 实现流式缩放，避免断点跳变
- 区块编号（如 `01`、`02`）使用等宽字体 + 强调色，作为视觉锚点
- 正文保持紧凑字号（0.875rem–0.95rem），符合极简风格
- 所有 Mono 标签类文本统一使用等宽字体，与正文形成对比

---

## 3. 间距系统

### 3.1 CSS 自定义属性

```css
:root {
    --content-padding: 4rem;
    --card-gap: 24px;
    --nav-height: 60px;
}

@media (max-width: 767px) {
    :root {
        --content-padding: 1.5rem;
    }
}
```

### 3.2 间距规范

| 场景 | 间距值 | 说明 |
|------|--------|------|
| 内容水平内边距（桌面） | 4rem | 左右留白，保持阅读舒适度 |
| 内容水平内边距（移动端） | 1.5rem | 缩小留白，适配小屏 |
| 卡片间距 | 24px | 卡片之间的统一间距 |
| 导航栏高度 | 60px | 固定导航栏高度 |
| 区块垂直内边距 | 6rem–8rem | 各内容区块上下间距 |
| 快速导航网格间距 | 1px | 极细分隔线效果 |
| 文章网格间距 | 32px | 文章卡片网格间距 |

### 3.3 间距使用原则

- 所有间距优先使用 CSS 自定义属性，确保全局一致性
- 区块间距（6–8rem）远大于卡片间距（24px），形成清晰的视觉分组
- 快速导航使用 1px 间距模拟边框效果，而非实际 border，避免盒模型问题
- 移动端仅调整 `--content-padding`，其余间距保持不变或按比例缩放

---

## 4. 动画系统

### 4.1 时长与缓动

```css
:root {
    --duration-fast: 150ms;
    --duration-normal: 300ms;
    --duration-slow: 500ms;

    --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}
```

| 变量 | 值 | 用途 |
|------|------|------|
| `--duration-fast` | 150ms | 悬停反馈、颜色切换、边框变化 |
| `--duration-normal` | 300ms | 通用过渡、元素显隐 |
| `--duration-slow` | 500ms | 页面级过渡、大位移动画 |
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | 默认缓动，Material Design 标准曲线 |
| `--ease-smooth` | cubic-bezier(0.16, 1, 0.3, 1) | 平滑缓动，图片过渡、弹性出场效果 |

### 4.2 关键动画定义

#### fadeInUp — 通用入场动画

```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

- 用途：页面元素滚动入场
- 时长：var(--duration-slow) (500ms)
- 缓动：var(--ease-default)

#### 滚动观察器动画

- 触发条件：IntersectionObserver，threshold: 0.1
- 初始状态：`opacity: 0; transform: translateY(20px–30px)`
- 结束状态：`opacity: 1; transform: translateY(0)`
- 时长：var(--duration-slow) (500ms)

#### 相册图片入场

- 初始状态：`opacity: 0; transform: translateY(60px)`
- 结束状态：`opacity: 1; transform: translateY(0)`
- 缓动：var(--ease-smooth) — cubic-bezier(0.16, 1, 0.3, 1)
- 位移量大于通用入场（60px vs 30px），营造更强的纵深效果

#### 相册滑出

- 位移：translateY(±60px)
- 时长：250ms
- 缓动：ease-in
- 方向：向上或向下，取决于交互方向

#### 跑马灯（Marquee）

```css
@keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
}
```

- 时长：40s
- 缓动：linear
- 循环：infinite
- 原理：内容复制一份，平移 -50% 实现无缝循环

#### 骨架屏闪烁（Shimmer）

```css
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
```

- 时长：1.5s
- 缓动：ease
- 循环：infinite
- 背景：线性渐变，模拟加载光泽

#### 光标闪烁（Cursor Blink）

```css
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
```

- 时长：1s
- 缓动：step-end
- 循环：infinite
- 用途：打字机效果光标

#### 滚动脉冲（Scroll Pulse）

```css
@keyframes scrollPulse {
    0%, 100% { opacity: 0.4; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(8px); }
}
```

- 时长：2s
- 缓动：ease-in-out
- 循环：infinite
- 用途：首页滚动提示箭头

### 4.3 动画使用原则

- 所有交互反馈使用 `--duration-fast`（150ms），确保即时响应感
- 页面入场动画使用 `--duration-slow`（500ms），给予用户阅读准备时间
- 图片类过渡优先使用 `--ease-smooth`，呈现弹性自然的运动感
- 禁止使用 `linear` 缓动（跑马灯除外），避免机械感
- 尊重 `prefers-reduced-motion`，在无障碍模式下禁用非必要动画

---

## 5. 断点系统

### 5.1 断点定义

| 名称 | 范围 | 媒体查询 |
|------|------|----------|
| Mobile | ≤ 767px | `@media (max-width: 767px)` |
| Tablet | 768px–1024px | `@media (max-width: 1024px)` |
| Desktop | ≥ 1025px | 默认样式 / `@media (min-width: 1025px)` |

### 5.2 各断点关键变化

#### Mobile (≤ 767px)

- `--content-padding` 缩小为 1.5rem
- 导航栏切换为汉堡菜单
- 页面标题使用 `clamp()` 自动缩小
- 文章网格从多列切换为单列
- 相册网格从多列切换为双列或单列
- 快速导航从横向网格切换为纵向列表
- 友链卡片从多列切换为单列
- 区块垂直间距适当缩小（6rem → 3rem–4rem）

#### Tablet (768px–1024px)

- `--content-padding` 适中（2rem–3rem）
- 文章网格切换为双列
- 相册网格切换为三列
- 导航栏保持水平布局但间距收紧

#### Desktop (≥ 1025px)

- 完整布局体验
- 文章网格三列
- 相册网格四列或自适应
- 快速导航四列网格
- 所有动画完整呈现

### 5.3 断点使用原则

- 采用桌面优先写法（max-width），与现有代码风格一致
- 页面标题使用 `clamp()` 流式缩放，减少断点处跳变
- 网格列数变化使用 CSS Grid 的 `auto-fill` / `auto-fit` + `minmax()` 优先，必要时辅以媒体查询
- 移动端优先保证内容可读性，其次考虑视觉表现

---

## 6. 全局样式规则

### 6.1 隐藏滚动条

```css
* {
    scrollbar-width: none;
}

*::-webkit-scrollbar {
    display: none;
}
```

- 全局隐藏滚动条，保持视觉纯净
- 滚动功能保留，仅隐藏滚动条 UI
- 适用于所有主流浏览器（Firefox: `scrollbar-width`, Chrome/Safari: `::-webkit-scrollbar`）

### 6.2 相册页面锁定滚动

```css
body.gallery-page {
    overflow: hidden;
}
```

- 相册灯箱打开时，禁止背景页面滚动
- 通过给 `body` 添加 `.gallery-page` 类控制
- 灯箱关闭时移除该类，恢复滚动

### 6.3 导航进度条

```css
.nav-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: var(--accent);
    z-index: 1000;
    transition: width var(--duration-normal) var(--ease-default);
}
```

- 固定在页面顶部，宽度随滚动进度变化
- 高度 2px，使用强调色
- z-index 高于导航栏，确保始终可见
- 宽度过渡使用默认缓动

### 6.4 红色渐变分隔线

```css
.red-separator {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
}
```

- 水平分隔线，两端渐隐为透明
- 中间使用强调色，形成视觉焦点
- 高度 1px，保持极简
- 用于区块之间、内容之间的分隔

### 6.5 其他全局规则

- **盒模型**：`box-sizing: border-box` 全局重置
- **默认边距清除**：`margin: 0; padding: 0` 在 body 上重置
- **文字渲染**：`-webkit-font-smoothing: antialiased` 优化字体渲染
- **图片默认**：`max-width: 100%; display: block` 防止溢出
- **链接样式**：默认 `color: inherit; text-decoration: none`，交互态使用 `var(--accent)`
- **选中态**：`::selection { background: var(--accent); color: #fff }` 统一选中高亮
