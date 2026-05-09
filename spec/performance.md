# 性能优化规范

> 静墨博客（JingMo Blog）前端性能优化标准，所有页面必须遵循。

---

## 1. 图片优化

| 类型 | 参数 | 预期大小 |
|------|------|----------|
| 缩略图 | `w=150&q=50` | 约 10-20KB |
| 主图 | `w=800&q=75` | 约 60-100KB |

### 加载属性

- 所有图片使用 `loading="lazy"` 和 `decoding="async"`
- 缩略图使用 `data-src` + `IntersectionObserver` 懒加载（进入视口时才赋值 `src`）

### 外部资源提示

- Unsplash 图片使用 `<link rel="dns-prefetch" href="//images.unsplash.com">`
- **不使用** `preconnect`（避免建立不必要的连接）

---

## 2. 相册加载策略（关键）

相册页面是性能敏感页面，必须严格遵循以下策略：

### 渲染流程

1. **页面立即渲染骨架和文字信息**（零网络请求，纯 HTML/CSS）
2. **主图异步加载**，加载完成后隐藏 skeleton
3. **缩略图通过 `requestIdleCallback` 延迟渲染**（timeout: 500ms）
4. **缩略图 `src` 通过 `IntersectionObserver` 按需赋值**
5. **下一张图片通过 `<link rel="prefetch">` 预取**

### 禁止事项

- ❌ 不使用 `new Image()` 预加载（避免内存浪费和重复请求）
- ❌ 不使用 `imageCache` 对象（浏览器 HTTP 缓存自动管理）

### ready 标志

- 通过 `requestAnimationFrame` 确保首帧渲染完成后再触发后续逻辑

```javascript
requestAnimationFrame(() => {
  ready = true;
});
```

---

## 3. CSS 优化

### 加载顺序

```
variables.css → base.css → components.css → page-specific.css
```

### 代码精简

- 150+ 行重复代码已提取到 `components.css`
- 使用 CSS 变量减少重复声明

### 动画性能

- 动画**仅使用** `transform` 和 `opacity`（GPU 加速，避免重排重绘）
- 禁止在动画中使用 `width`、`height`、`top`、`left` 等触发重排的属性

---

## 4. JavaScript 优化

### 事件处理

| 事件 | 策略 | 参数 |
|------|------|------|
| `scroll` | `throttle` | 16ms（约 60fps） |
| 搜索输入 | `debounce` | 300ms |

### Observer 清理

- 所有 `IntersectionObserver` / `MutationObserver` 使用后必须调用 `disconnect()` 清理，防止内存泄漏

### 事件监听选项

| 事件 | 选项 | 原因 |
|------|------|------|
| `touchstart` | `{ passive: true }` | 不需要 `preventDefault`，提升滚动性能 |
| `wheel` | `{ passive: false }` | 需要 `preventDefault` 阻止默认滚动 |

---

## 5. 字体优化

- Google Fonts 使用 `<link rel="preconnect" href="https://fonts.googleapis.com">` 和 `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
- 仅加载需要的字重：**400, 500, 700, 900**
- 禁止加载未使用的字重

---

## 6. 滚动条

### 全局隐藏

```css
* {
  scrollbar-width: none;           /* Firefox */
  -ms-overflow-style: none;        /* IE/Edge */
}

*::-webkit-scrollbar {
  display: none;                   /* Chrome/Safari */
}
```

- 隐藏滚动条但**保留滚动功能**（`overflow: auto` 而非 `hidden`）
