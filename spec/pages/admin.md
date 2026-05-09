# 管理后台规范

## 路由

- 路径：`/admin`
- 入口文件：`admin/index.html`
- 数据接口：
  - `POST /api/auth/login`
  - `GET /api/articles`
  - `POST /api/articles`
  - `PUT /api/articles/:id`
  - `DELETE /api/articles/:id`
  - `POST /api/upload`
  - `GET /api/categories`
  - `POST /api/categories`
  - `DELETE /api/categories/:id`
  - `GET /api/tags`
  - `POST /api/tags`
  - `DELETE /api/tags/:id`

## 文件引用

| 文件 | 用途 |
|------|------|
| `admin/index.html` | 管理后台 HTML 结构 |
| `admin/app.js` | 管理后台交互逻辑 |
| `admin/styles.css` | 管理后台专用样式 |

## 页面结构

### 1. 登录页

- 居中登录表单
- 字段：用户名、密码
- 登录按钮
- 错误提示信息

### 2. 侧边栏导航

- 顶部：博客名称 `静墨`
- 导航项：
  - `仪表盘`（Dashboard）
  - `文章管理`
  - `分类管理`
  - `标签管理`
  - `媒体库`
  - `设置`
- 底部：退出登录按钮
- 可折叠（移动端）

### 3. 仪表盘

- 统计卡片：
  - 文章总数
  - 分类数
  - 标签数
  - 最近更新时间
- 最近文章列表（5 篇）

### 4. 文章管理

- 文章列表表格：
  - 标题
  - 分类
  - 标签
  - 状态（草稿 / 已发布）
  - 创建日期
  - 操作（编辑 / 删除）
- 新建文章按钮
- 搜索与筛选

### 5. 文章编辑器

- 标题输入框
- 分类选择（下拉）
- 标签选择（多选）
- 状态切换（草稿 / 已发布）
- Markdown 编辑器：
  - 左侧：Markdown 输入
  - 右侧：实时预览
  - 工具栏：加粗、斜体、标题、链接、图片、代码块、引用
- 封面图上传
- 保存 / 发布按钮

### 6. 分类管理

- 分类列表：
  - 分类名称
  - 文章数
  - 操作（编辑 / 删除）
- 新建分类表单

### 7. 标签管理

- 标签列表：
  - 标签名称
  - 文章数
  - 操作（编辑 / 删除）
- 新建标签表单

### 8. 媒体库

- 图片网格展示
- 上传按钮
- 图片信息：文件名、大小、上传时间
- 复制图片 URL
- 删除图片

## 交互逻辑

### 登录

1. 输入用户名和密码
2. 点击登录按钮
3. 调用 `POST /api/auth/login`
4. 成功：存储 token 到 `localStorage`，跳转仪表盘
5. 失败：显示错误提示
6. 已登录状态直接跳转仪表盘

### 认证守卫

1. 每次进入管理后台检查 `localStorage` 中的 token
2. 无 token 或 token 过期：重定向到登录页
3. API 请求携带 `Authorization: Bearer {token}` 头
4. 401 响应：清除 token，重定向登录页

### 文章 CRUD

1. **新建文章**：
   - 点击新建按钮打开编辑器
   - 填写标题、内容、分类、标签
   - 点击保存：调用 `POST /api/articles`，创建草稿
   - 点击发布：调用 `POST /api/articles`，状态设为已发布

2. **编辑文章**：
   - 点击文章列表中的编辑按钮
   - 加载文章数据到编辑器
   - 修改后点击保存：调用 `PUT /api/articles/:id`

3. **删除文章**：
   - 点击删除按钮
   - 弹出确认对话框
   - 确认后调用 `DELETE /api/articles/:id`
   - 刷新列表

### Markdown 编辑器

1. 左右分栏：编辑区 + 预览区
2. 编辑区输入 Markdown，预览区实时渲染
3. 工具栏按钮插入对应 Markdown 语法
4. 图片插入：上传图片获取 URL，插入 `![](url)` 语法
5. 支持快捷键：
   - `Ctrl+B`：加粗
   - `Ctrl+I`：斜体
   - `Ctrl+K`：链接
   - `Ctrl+S`：保存

### 图片上传

1. 点击上传按钮或拖拽图片到上传区域
2. 调用 `POST /api/upload` 上传图片
3. 上传进度条显示
4. 上传成功返回图片 URL
5. 在编辑器中插入图片语法

### 分类 / 标签管理

1. **新建**：输入名称，点击添加按钮
2. **编辑**：点击编辑按钮，修改名称，保存
3. **删除**：点击删除按钮，确认后删除
4. 有关联文章的分类 / 标签提示不可删除或确认级联操作

### 退出登录

1. 点击退出按钮
2. 清除 `localStorage` 中的 token
3. 重定向到登录页

## 样式要点

### 整体风格

- 延续博客黑白红主题
- 管理后台背景稍亮：`#111111`
- 卡片 / 面板背景：`#1a1a1a`
- 边框：`#2a2a2a`
- 强调色：`#e74c3c`

### 侧边栏

```css
.sidebar {
  width: 240px;
  background: #0a0a0a;
  border-right: 1px solid #222;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 24px 0;
}
.sidebar-nav-item {
  padding: 12px 24px;
  color: #888;
  transition: all 0.2s ease;
  cursor: pointer;
}
.sidebar-nav-item:hover,
.sidebar-nav-item.active {
  color: #f5f5f5;
  background: rgba(231, 76, 60, 0.1);
  border-left: 3px solid #e74c3c;
}
```

### 主内容区

```css
.main-content {
  margin-left: 240px;
  padding: 32px;
  min-height: 100vh;
}
```

### 表格

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #222;
  color: #888;
  font-size: 12px;
  text-transform: uppercase;
}
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #1a1a1a;
  color: #d4d4d4;
}
.data-table tr:hover td {
  background: rgba(231, 76, 60, 0.05);
}
```

### 按钮

- 主按钮：`background: #e74c3c`, `color: #fff`, `padding: 8px 20px`
- 次按钮：`border: 1px solid #333`, `color: #d4d4d4`, `padding: 8px 20px`
- 危险按钮：`border: 1px solid #e74c3c`, `color: #e74c3c`
- Hover：对应颜色加深

### 表单

- 输入框：`background: #151515`, `border: 1px solid #333`, `color: #f5f5f5`, `padding: 10px 14px`
- 获焦：`border-color: #e74c3c`
- 下拉框：同输入框样式
- 标签：`font-size: 14px`, `color: #888`, `margin-bottom: 6px`

### Markdown 编辑器

```css
.editor-container {
  display: flex;
  gap: 1px;
  background: #222;
  border: 1px solid #222;
  min-height: 500px;
}
.editor-input {
  flex: 1;
  background: #0a0a0a;
  color: #d4d4d4;
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  padding: 16px;
  border: none;
  resize: none;
  outline: none;
}
.editor-preview {
  flex: 1;
  background: #111;
  padding: 16px;
  overflow-y: auto;
}
```

### 统计卡片

```css
.stat-card {
  background: #1a1a1a;
  border: 1px solid #222;
  padding: 24px;
  text-align: center;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #f5f5f5;
}
.stat-label {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}
```

## 响应式适配

### 桌面端（≥1024px）

- 侧边栏固定 240px
- 主内容区左侧偏移 240px
- 编辑器左右分栏
- 统计卡片 4 列网格

### 平板端（768px - 1023px）

- 侧边栏可折叠，默认收起
- 主内容区全宽
- 编辑器左右分栏（比例缩小）
- 统计卡片 2 列网格

### 移动端（<768px）

- 侧边栏隐藏，通过汉堡菜单打开（overlay 模式）
- 主内容区全宽，内边距 `16px`
- 编辑器切换模式：编辑 / 预览标签页切换
- 统计卡片 1 列堆叠
- 表格横向滚动
