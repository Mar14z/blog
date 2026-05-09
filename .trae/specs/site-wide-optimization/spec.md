# 全站优化与改进 Spec

## Why
网站功能基本完成，但在安全性、SEO、代码质量、内容功能等方面存在大量改进空间。通过系统性审查发现约 50+ 个可优化项，需要按优先级逐步实施。

## What Changes
- 补全 SEO 基础设施（Open Graph、JSON-LD、sitemap、robots.txt）
- 增强安全性（XSS 防护、CSRF、输入验证、Helmet 中间件）
- 提取内联 CSS/JS 到外部文件，减少代码重复
- 新增内容功能（文章目录 ToC、阅读进度条、相关文章、RSS）
- 完善错误处理和空状态展示
- 添加关键中间件（compression、helmet、cors、rate-limit）
- 补全可访问性（aria-label、语义标签、焦点状态）
- 优化管理后台（草稿/发布流程、数据导出）

## Impact
- Affected specs: spec/design-system.md, spec/pages/*.md, spec/api.md, spec/architecture.md, spec/components.md, spec/performance.md, spec/accessibility.md
- Affected code: 所有 views/*.html, public/css/*.css, public/js/*.js, server/*.js

## ADDED Requirements

### Requirement: SEO 基础设施
系统 SHALL 为每个页面提供完整的 SEO 支持。

#### Scenario: 社交分享
- **WHEN** 用户在社交媒体分享页面链接
- **THEN** 显示正确的 Open Graph 标题、描述、图片

#### Scenario: 搜索引擎收录
- **WHEN** 搜索引擎爬虫访问网站
- **THEN** 能获取 sitemap.xml 和 robots.txt
- **AND** 文章页面包含 JSON-LD 结构化数据

### Requirement: 安全防护
系统 SHALL 提供基础 Web 安全防护。

#### Scenario: XSS 攻击防护
- **WHEN** 用户提交包含 HTML/JS 的内容
- **THEN** 系统在存储前进行 sanitize 处理

#### Scenario: 请求限流
- **WHEN** 单一 IP 在短时间内发送大量请求
- **THEN** 系统返回 429 状态码

### Requirement: 文章阅读增强
系统 SHALL 提供文章阅读辅助功能。

#### Scenario: 文章目录
- **WHEN** 用户阅读长文章
- **THEN** 页面侧边显示可点击的目录导航

#### Scenario: 阅读进度
- **WHEN** 用户滚动文章页面
- **THEN** 页面顶部显示阅读进度条

### Requirement: 代码质量提升
系统 SHALL 将内联 CSS/JS 提取到外部文件。

#### Scenario: Gallery 页面
- **WHEN** 开发者维护相册页面
- **THEN** CSS 和 JS 位于独立文件中，而非内联在 HTML 中

### Requirement: 错误处理完善
系统 SHALL 在 API 失败时提供友好的用户反馈。

#### Scenario: 网络错误
- **WHEN** API 请求因网络问题失败
- **THEN** 页面显示友好的错误提示，而非空白

#### Scenario: 图片加载失败
- **WHEN** 图片 URL 无法加载
- **THEN** 显示占位图或错误提示

## MODIFIED Requirements

### Requirement: API 响应格式
分页响应 SHALL 包含 totalPages 字段，便于前端计算总页数。

### Requirement: 导航栏
所有导航链接 SHALL 添加 aria-label 属性，当前页面链接 SHALL 使用 aria-current="page"。

## REMOVED Requirements
（无移除项）
