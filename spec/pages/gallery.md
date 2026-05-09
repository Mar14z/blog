# 相册页规范

## 路由

- 路径：`/gallery`
- 入口文件：`gallery.html`
- 数据接口：`/api/gallery`

## 文件引用

| 文件 | 用途 |
|------|------|
| `gallery.html` | 相册页 HTML 结构 |
| `css/style.css` | 全局样式 |
| `css/gallery.css` | 相册页专用样式 |
| `js/gallery.js` | 相册页交互逻辑 |
| `js/api.js` | API 请求封装 |

## 页面结构

### 1. 全局容器

- 全视口布局：`100vw × 100vh`
- 溢出隐藏：`overflow: hidden`
- 无滚动条

### 2. 主图区域

- 居中展示当前图片
- 图片尺寸参数：`w=800&q=75`
- 切换动画容器

### 3. DNA 效果文字列

- 左列（8 个文字项）
- 右列（8 个文字项）
- 当前图片对应项高亮（通过 `classList.toggle`）
- 高亮项位移：`translateX(±10px)`

### 4. 缩略图栏

- 底部水平排列缩略图
- 缩略图尺寸：`70×50px`
- 图片参数：`w=150&q=50`
- 懒加载：`data-src` + `IntersectionObserver`

### 5. 导航控件

- 上一张 / 下一张按钮
- 键盘方向键支持
- 滚轮切换支持
- 触摸滑动支持

## 交互逻辑

### 加载策略

1. **骨架屏阶段**：
   - 页面初始渲染骨架屏 shimmer 动画
   - 占位区域与最终布局一致

2. **主图加载**：
   - 优先加载当前主图
   - 主图 URL 参数：`w=800&q=75`
   - 加载完成后淡入显示

3. **缩略图延迟加载**：
   - 使用 `requestIdleCallback` 在浏览器空闲时开始加载缩略图
   - 缩略图使用 `data-src` 存储真实 URL
   - `IntersectionObserver` 监听缩略图进入视口时替换 `src`
   - 缩略图 URL 参数：`w=150&q=50`

### 图片切换动画

1. **切换流程**：
   - 当前图片执行 `slide-out` 动画（向上或向下滑出）
   - 动画时长：250ms，缓动：`ease-in`
   - 加载新图片 `src`
   - 新图片执行 `slide-in` 动画
   - 动画时长：600ms，缓动：`cubic-bezier(0.16, 1, 0.3, 1)`

2. **方向判断**：
   - 下一张：当前图 slide-out-up，新图 slide-in-from-bottom
   - 上一张：当前图 slide-out-down，新图 slide-in-from-top

3. **防抖机制**：
   - `isAnimating` 标志位防止切换过程中重复触发
   - 动画完成后重置 `isAnimating = false`

4. **就绪标志**：
   - `ready` 标志通过 `requestAnimationFrame` 设置
   - 确保浏览器完成渲染后再允许交互

### 预加载

1. 切换到当前图片后，预加载下一张图片
2. 使用 `<link rel="prefetch" href="...">` 方式
3. 或使用 `new Image().src` 预加载

### DNA 效果

1. 左右两列各 8 个文字项
2. 当前图片对应的文字项通过 `classList.toggle('active')` 切换高亮
3. 高亮项：`translateX(10px)`（左列）或 `translateX(-10px)`（右列）
4. 颜色变红，非高亮项变暗

### 导航方式

1. **键盘导航**：
   - `↑` 或 `←`：上一张
   - `↓` 或 `→`：下一张
   - `Esc`：返回

2. **按钮点击**：
   - 点击上一张/下一张按钮

3. **滚轮切换**：
   - `wheel` 事件监听
   - 防抖处理，避免快速连续触发
   - 向下滚动：下一张
   - 向上滚动：上一张

4. **触摸滑动**：
   - `touchstart` 记录起始 Y 坐标
   - `touchend` 计算滑动距离
   - 上滑：下一张
   - 下滑：上一张
   - 最小滑动距离阈值：`50px`

5. **缩略图点击**：
   - 点击缩略图直接跳转到对应图片

## 样式要点

### 全局容器

```css
.gallery-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: #0a0a0a;
}
```

### 主图

```css
.main-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 70%;
  max-height: 70%;
  object-fit: contain;
}
```

### 切换动画

```css
@keyframes slide-out-up {
  from { transform: translate(-50%, -50%); opacity: 1; }
  to { transform: translate(-50%, calc(-50% - 60px)); opacity: 0; }
}

@keyframes slide-in-from-bottom {
  from { transform: translate(-50%, calc(-50% + 60px)); opacity: 0; }
  to { transform: translate(-50%, -50%); opacity: 1; }
}

.slide-out-up { animation: slide-out-up 250ms ease-in forwards; }
.slide-in { animation: slide-in-from-bottom 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

### DNA 文字列

```css
.dna-item {
  transition: all 0.4s ease;
  color: #333;
  font-size: 14px;
}
.dna-item.active {
  color: #e74c3c;
  transform: translateX(10px); /* 左列 */
}
.dna-column.right .dna-item.active {
  transform: translateX(-10px); /* 右列 */
}
```

### 缩略图

```css
.thumbnail {
  width: 70px;
  height: 50px;
  object-fit: cover;
  border: 1px solid #222;
  opacity: 0.5;
  transition: all 0.3s ease;
  cursor: pointer;
}
.thumbnail.active {
  border-color: #e74c3c;
  opacity: 1;
}
.thumbnail:hover {
  opacity: 0.8;
}
```

### 骨架屏 Shimmer

```css
.skeleton {
  background: linear-gradient(90deg, #151515 25%, #222 50%, #151515 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 响应式适配

### 桌面端（≥1024px）

- 主图最大宽度 70%，最大高度 70%
- DNA 文字列左右两侧固定宽度
- 缩略图栏底部水平排列

### 平板端（768px - 1023px）

- 主图最大宽度 80%，最大高度 65%
- DNA 文字列隐藏或缩小
- 缩略图栏底部水平排列，缩小尺寸

### 移动端（<768px）

- 主图最大宽度 90%，最大高度 60%
- DNA 文字列隐藏
- 缩略图栏底部水平滚动
- 缩略图尺寸缩小至 `50×36px`
- 导航按钮放大（触摸友好）
- 触摸滑动为主要导航方式
