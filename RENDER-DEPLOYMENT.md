# 静墨博客 - Render 部署指南

> 使用 Render + MongoDB Atlas 免费托管你的博客

---

## 📋 目录

- [第一步：准备MongoDB Atlas数据库](#第一步准备mongodb-atlas数据库)
- [第二步：推送代码到GitHub](#第二步推送代码到github)
- [第三步：配置Render部署](#第三步配置render部署)
- [第四步：环境变量配置](#第四步环境变量配置)
- [第五步：域名和SSL配置](#第五步域名和ssl配置)
- [常见问题](#常见问题)

---

## 第一步：准备MongoDB Atlas数据库

### 1.1 注册MongoDB Atlas

1. 访问 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 点击 "Start Free" 创建免费账户
3. 使用Google账号或邮箱注册

### 1.2 创建免费集群

1. 登录后点击 "Build a Database"
2. 选择 **FREE** 套餐 (M0 Sandbox)
   - **Cluster Tier**: M0 Sandbox (Free)
   - **Cloud Provider & Region**: 选择 `Singapore` (亚太地区，延迟低)
   - **Cluster Name**: 可以保持默认 `Cluster0`

3. 点击 "Create" 等待集群创建（约3-5分钟）

### 1.3 配置数据库访问

1. 点击 "Security" → "Database Access"
2. 点击 "Add New Database User"
3. 配置：
   ```
   Username: blog_admin
   Password: [生成一个强密码，保存好！]
   Database User Privileges: Read and write to any database
   ```
4. 点击 "Add User"

### 1.4 配置网络访问

1. 点击 "Security" → "Network Access"
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere" (0.0.0.0/0)
4. 点击 "Confirm"

### 1.5 获取连接字符串

1. 点击 "Deployment" → "Database"
2. 点击 "Connect" 按钮
3. 选择 "Connect your application"
4. 复制连接字符串：
   ```bash
   mongodb+srv://blog_admin:<password>@cluster0.xxxxxx.mongodb.net/blog?retryWrites=true&w=majority
   ```
5. **重要**：将 `<password>` 替换为你刚才设置的密码

---

## 第二步：推送代码到GitHub

### 2.1 创建GitHub仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 "+" → "New repository"
3. 配置：
   - **Repository name**: `jingmo-blog`
   - **Description**: 静墨博客 - 极简优雅的博客系统
   - **Visibility**: Public (免费) 或 Private
   - **Initialize**: 不勾选任何选项

4. 点击 "Create repository"

### 2.2 初始化Git本地仓库

```bash
cd f:\TraeCode\blog

# 初始化Git仓库
git init

# 添加所有文件（除了node_modules和.env）
git add .

# 提交
git commit -m "Initial commit: 静墨博客"

# 添加远程仓库（替换为你自己的GitHub仓库URL）
git remote add origin https://github.com/你的用户名/jingmo-blog.git

# 推送
git branch -M main
git push -u origin main
```

### 2.3 创建生产环境 .env 文件

创建 `f:\TraeCode\blog\.env.production`：
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://blog_admin:你的密码@cluster0.xxxxxx.mongodb.net/blog?retryWrites=true&w=majority
JWT_SECRET=generate-a-very-long-random-string-here-32chars
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password-in-production
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

---

## 第三步：配置Render部署

### 3.1 注册Render账号

1. 访问 [Render](https://render.com)
2. 点击 "Get Started"
3. 使用GitHub账号登录（推荐）
4. 授权Render访问你的GitHub仓库

### 3.2 创建Web Service

1. 登录后点击 "New +" → "Web Service"
2. 连接到你的GitHub仓库：
   - **GitHub**: 选择你的博客仓库
   - **Branch**: `main`
   - **Root Directory**: (留空)
3. 配置基础设置：
   - **Name**: `jingmo-blog`
   - **Region**: `Singapore` (亚太地区)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **重要**：选择免费套餐
   - **Plan**: Free

### 3.3 配置环境变量

在 "Environment" 部分添加以下环境变量：

#### 必需的环境变量：

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://blog_admin:你的密码@cluster0.xxxxxx.mongodb.net/blog?retryWrites=true&w=majority
JWT_SECRET=generate-a-very-long-random-string-here-32chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password-in-production
```

#### 生成JWT_SECRET的方法：

在PowerShell中生成：
```powershell
$bytes = New-Object byte[] 32
$ rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

或者使用在线工具生成：https://randomkeygen.com/

### 3.4 高级设置（可选）

点击 "Advanced"：

1. **Auto Deploy**: Yes (代码推送时自动部署)
2. **Health Check Path**: `/api/health`

### 3.5 开始部署

1. 点击 "Create Web Service"
2. Render会自动：
   - 安装依赖 (`npm install`)
   - 构建项目
   - 启动服务
3. 查看部署日志，等待完成

---

## 第四步：环境变量配置

### 在Render控制台配置

1. 点击你的Web Service
2. 进入 "Environment" 标签
3. 在 "Environment Variables" 部分添加：

#### 必需变量：

```bash
# 服务器配置
NODE_ENV = production
PORT = 3000

# MongoDB（替换为你自己的）
MONGODB_URI = mongodb+srv://blog_admin:你的密码@cluster0.xxxxxx.mongodb.net/blog

# JWT（使用强密码）
JWT_SECRET = 你的随机密钥（至少32字符）

# 管理员账户（强烈建议修改！）
ADMIN_USERNAME = admin
ADMIN_PASSWORD = 你的新密码

# 上传配置
UPLOAD_DIR = /var/data/uploads
MAX_FILE_SIZE = 5242880
```

#### 生成强密码：

在PowerShell中：
```powershell
# 生成16字符随机密码
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 16
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 安全建议

⚠️ **重要**：
- JWT_SECRET 必须足够复杂（至少32字符）
- ADMIN_PASSWORD 不要使用默认值
- 定期更换密码
- 不要在GitHub上提交 `.env` 文件

---

## 第五步：域名和SSL配置

### 5.1 自动SSL证书

Render会自动为你的网站配置免费的SSL证书！

访问 `https://jingmo-blog.onrender.com` 会自动使用HTTPS。

### 5.2 自定义域名（可选）

1. 在Render控制台点击你的Web Service
2. 进入 "Settings"
3. 找到 "Custom Domains"
4. 点击 "Add Custom Domain"
5. 输入你的域名（如 `blog.yourdomain.com`）
6. 按照指示添加DNS记录

#### DNS配置：

在你的域名提供商（如阿里云、腾讯云）添加：

```
类型: CNAME
名称: blog
值: jingmo-blog.onrender.com
TTL: 3600
```

### 5.3 强制HTTPS

默认情况下Render会自动重定向HTTP到HTTPS。

---

## 第六步：测试部署

### 6.1 访问你的网站

部署成功后，访问：
- Render分配的URL: `https://jingmo-blog.onrender.com`
- 或你的自定义域名

### 6.2 测试功能

1. **首页** - 访问 `https://jingmo-blog.onrender.com/`
2. **文章列表** - 访问 `https://jingmo-blog.onrender.com/#articles`
3. **API测试** - 访问 `https://jingmo-blog.onrender.com/api/health`
4. **管理后台** - 访问 `https://jingmo-blog.onrender.com/admin`

### 6.3 登录管理后台

1. 访问 `/admin`
2. 使用设置的管理员账号登录
3. 开始管理文章！

---

## 常见问题

### Q1: 部署失败怎么办？

**检查日志**：
1. 在Render控制台点击 "Logs"
2. 查看错误信息
3. 常见问题：
   - ❌ `npm install` 失败 → 检查package.json
   - ❌ MongoDB连接失败 → 检查MONGODB_URI
   - ❌ 端口错误 → 确保PORT=3000

### Q2: 网站响应很慢？

**原因**：
- 免费套餐会在30分钟无访问后休眠
- 首次访问需要唤醒（约30秒）

**解决方案**：
- 使用UptimeRobot等免费监控服务保持在线
- 或者升级到付费套餐

### Q3: 如何更新网站？

**方式一：自动部署**
1. 修改本地代码
2. `git add .`
3. `git commit -m "Update"`
4. `git push`
5. Render自动检测并部署

**方式二：手动部署**
1. 在Render控制台点击 "Manual Deploy"
2. 选择 "Deploy latest commit"

### Q4: 数据库连接失败？

**检查项**：
1. ✅ MONGODB_URI格式正确
2. ✅ 数据库用户密码正确
3. ✅ 网络访问允许0.0.0.0/0
4. ✅ 集群状态为Running

**测试连接**：
```bash
# 本地测试（需要MongoDB Compass）
mongodb+srv://blog_admin:密码@cluster0.xxxxxx.mongodb.net
```

### Q5: 如何备份数据库？

**在MongoDB Atlas中**：
1. 进入你的集群
2. 点击 "Deployment" → "Backup"
3. 查看自动备份（免费套餐包含）
4. 如需恢复，联系MongoDB支持

**手动备份**：
```bash
mongodump --uri="mongodb+srv://blog_admin:密码@cluster0.xxxxxx.mongodb.net/blog"
```

### Q6: 图片上传不工作？

**原因**：免费套餐没有持久化存储

**解决方案**：
1. 使用外部图床（推荐）
2. 使用Cloudinary等CDN服务
3. 或者升级到付费套餐

**推荐方案**：使用免费的Cloudinary
1. 注册 [Cloudinary](https://cloudinary.com)
2. 获取Cloud Name和API Keys
3. 在博客中集成图床API
4. 这样图片会自动上传到CDN

### Q7: 如何查看访问统计？

**Render Metrics**：
- 免费查看基本指标
- 进入 "Insights" 标签

**推荐工具**：
- [Google Analytics](https://analytics.google.com) - 免费，功能强大
- [Plausible](https://plausible.io) - 隐私友好，免费开源

---

## 🎯 下一步优化

部署成功后，你可以继续优化：

1. **添加评论系统** - 使用Giscus（基于GitHub Discussions）
2. **SEO优化** - 生成sitemap.xml，添加meta标签
3. **性能优化** - 添加Redis缓存
4. **监控告警** - 使用UptimeRobot监控网站
5. **自动化部署** - 设置CI/CD流程

---

## 📞 获取帮助

- **Render文档**: https://render.com/docs
- **MongoDB Atlas文档**: https://docs.atlas.mongodb.com
- **静墨博客GitHub**: https://github.com/Mar14z/blog

---

## ⚠️ 重要提醒

1. **定期备份** - 免费套餐数据不会自动备份
2. **监控使用量** - 避免超出免费额度
3. **安全第一** - 使用强密码，不要泄露敏感信息
4. **阅读文档** - Render和MongoDB Atlas都有详细文档

---

**祝你部署成功！🎉**

如果遇到问题，随时问我！
