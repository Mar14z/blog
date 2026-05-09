# 静墨博客 - API 接口规范

## 基础配置

| 项目 | 值 |
|------|-----|
| Base URL | `/api` |
| 认证方式 | Bearer Token (JWT) |
| Content-Type | `application/json` |

---

## 统一响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误信息",
  "errors": [ ... ]
}
```

---

## 接口列表

### 认证模块 (Auth)

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 否 | 用户登录 |
| GET | `/api/auth/me` | Bearer | 获取当前用户信息 |
| POST | `/api/auth/logout` | 否 | 用户登出 |

#### POST /api/auth/login

- **请求体**：
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "jwt_token_string",
      "user": {
        "id": "string",
        "username": "string"
      }
    }
  }
  ```

#### GET /api/auth/me

- **请求头**：`Authorization: Bearer <token>`
- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "id": "string",
      "username": "string"
    }
  }
  ```

#### POST /api/auth/logout

- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "登出成功",
    "data": null
  }
  ```

---

### 文章模块 (Articles)

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/articles` | 否 | 获取文章列表 |
| GET | `/api/articles/categories` | 否 | 获取分类列表 |
| GET | `/api/articles/tags` | 否 | 获取标签列表 |
| GET | `/api/articles/featured` | 否 | 获取推荐文章 |
| GET | `/api/articles/:slug` | 否 | 获取单篇文章 |
| POST | `/api/articles` | Bearer | 创建文章 |
| PUT | `/api/articles/:id` | Bearer | 更新文章 |
| DELETE | `/api/articles/:id` | Bearer | 删除文章 |

#### GET /api/articles

- **查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | number | 10 | 每页数量，最大 200 |
| `page` | number | 1 | 页码 |
| `category` | string | - | 按分类筛选 |
| `tag` | string | - | 按标签筛选 |
| `search` | string | - | 搜索关键词 |
| `sort` | string | -createdAt | 排序字段 |

- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "articles": [ ... ],
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
  ```

#### GET /api/articles/categories

- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": ["技术", "设计", "生活"]
  }
  ```

#### GET /api/articles/tags

- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": ["JavaScript", "CSS", "Node.js"]
  }
  ```

#### GET /api/articles/featured

- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": [ ... ]
  }
  ```

#### GET /api/articles/:slug

- **路径参数**：`slug` - 文章别名
- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "_id": "string",
      "title": "string",
      "slug": "string",
      "content": "string",
      "category": "string",
      "tags": ["string"],
      "featured": false,
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  }
  ```

#### POST /api/articles

- **请求头**：`Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "title": "string",
    "content": "string",
    "category": "string",
    "tags": ["string"],
    "featured": false
  }
  ```

#### PUT /api/articles/:id

- **请求头**：`Authorization: Bearer <token>`
- **路径参数**：`id` - 文章 ID
- **请求体**：同创建文章，字段可选

#### DELETE /api/articles/:id

- **请求头**：`Authorization: Bearer <token>`
- **路径参数**：`id` - 文章 ID

---

### 上传模块 (Upload)

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/upload/image` | Bearer | 上传图片 |
| DELETE | `/api/upload/image/:filename` | Bearer | 删除图片 |

#### POST /api/upload/image

- **请求头**：
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **请求体**：`image` 字段，文件类型
- **限制**：最大 5MB
- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "/uploads/filename.jpg",
      "filename": "filename.jpg"
    }
  }
  ```

#### DELETE /api/upload/image/:filename

- **请求头**：`Authorization: Bearer <token>`
- **路径参数**：`filename` - 文件名

---

### 系统模块 (System)

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/health` | 否 | 健康检查 |

#### GET /api/health

- **成功响应**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "status": "ok",
      "uptime": 12345,
      "timestamp": "ISO 8601"
    }
  }
  ```

---

## 已知问题

| 编号 | 问题 | 影响范围 | 优先级 |
|------|------|----------|--------|
| API-001 | 上传接口错误处理不一致 | `/api/upload/image` | 高 |
| API-002 | JWT 认证中间件逻辑重复 | `middleware/auth.js` | 高 |
| API-003 | 各路由响应格式不统一 | 全部路由 | 中 |
| API-004 | 静态资源缺少缓存头 | 静态文件服务 | 低 |

### 问题详情

#### API-001：上传接口错误处理不一致

上传图片时，部分错误场景返回的响应格式与统一规范不符，缺少 `code` 字段或 `errors` 数组结构不一致。

#### API-002：JWT 认证中间件逻辑重复

`auth.js` 中间件内存在重复的 token 解析与验证逻辑，应抽取为独立函数复用。

#### API-003：各路由响应格式不统一

部分路由直接返回数据而非包裹在 `{ code, message, data }` 结构中，需统一处理。

#### API-004：静态资源缺少缓存头

Express 静态文件服务未配置 `Cache-Control` 等缓存头，影响加载性能。
