# 静墨博客 - Render 部署清单

## ✅ 部署前检查清单

### 1. 代码准备
- [x] package.json 配置正确（start脚本、依赖）
- [x] .env.example 存在
- [x] .gitignore 配置正确（排除敏感文件）
- [x] 代码已推送到GitHub

### 2. MongoDB Atlas 配置
- [ ] 注册 MongoDB Atlas 账号
- [ ] 创建免费集群（M0 Sandbox）
- [ ] 配置数据库用户（blog_admin）
- [ ] 配置网络访问（Allow from Anywhere）
- [ ] 获取连接字符串

### 3. Render 配置
- [ ] 注册 Render 账号（使用GitHub登录）
- [ ] 创建 Web Service
- [ ] 连接 GitHub 仓库
- [ ] 配置构建命令：`npm install`
- [ ] 配置启动命令：`npm start`
- [ ] 选择免费套餐（Free）
- [ ] 配置环境变量

### 4. 必需的环境变量

在 Render 控制台配置以下变量：

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://blog_admin:<密码>@cluster0.xxxxxx.mongodb.net/blog?retryWrites=true&w=majority
JWT_SECRET=<至少32字符的随机字符串>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<你的强密码>
```

### 5. 部署后测试

测试以下URL（将 `your-app` 替换为你的Render应用名）：

- [ ] 首页：`https://your-app.onrender.com/`
- [ ] 文章页：`https://your-app.onrender.com/article`
- [ ] 关于页：`https://your-app.onrender.com/about`
- [ ] API健康检查：`https://your-app.onrender.com/api/health`
- [ ] 管理后台：`https://your-app.onrender.com/admin`
- [ ] 文章API：`https://your-app.onrender.com/api/articles`

### 6. 安全设置

- [ ] 修改默认管理员密码
- [ ] 使用强JWT_SECRET（至少32字符）
- [ ] 确保.env文件不在GitHub上
- [ ] 启用自动部署

---

## 🚀 快速开始

### 第一步：配置MongoDB Atlas（15分钟）

1. 访问 https://www.mongodb.com/atlas
2. 注册账号
3. 创建免费集群
4. 配置数据库用户
5. 获取连接字符串

### 第二步：推送代码到GitHub（5分钟）

```bash
cd f:\TraeCode\blog

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/jingmo-blog.git
git push -u origin main
```

### 第三步：配置Render（10分钟）

1. 访问 https://render.com
2. 使用GitHub登录
3. 点击 "New Web Service"
4. 选择你的博客仓库
5. 配置：
   - **Name**: jingmo-blog
   - **Region**: Singapore
   - **Build Command**: npm install
   - **Start Command**: npm start
6. 添加环境变量
7. 点击 "Create Web Service"

### 第四步：测试（5分钟）

部署完成后，测试所有页面是否正常工作。

---

## 📝 详细文档

完整的部署指南请查看：[RENDER-DEPLOYMENT.md](./RENDER-DEPLOYMENT.md)

---

## ⚠️ 重要提醒

1. **生成强密码**
   ```powershell
   # PowerShell生成32字符随机字符串
   $bytes = New-Object byte[] 32
   [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```

2. **免费套餐限制**
   - 750小时/月（足够24/7运行）
   - 30分钟无活动后休眠
   - 首次访问需30秒唤醒
   - 100GB带宽/月

3. **保持在线**
   - 使用 UptimeRobot 免费监控
   - 设置5分钟检测一次
   - 自动唤醒休眠实例

---

## 🔧 常见问题

### Q: 部署失败？
检查 Render 日志，常见问题：
- MONGODB_URI 格式错误
- 环境变量缺失
- npm install 失败

### Q: 数据库连接失败？
- 检查 MONGODB_URI 格式
- 确认数据库用户名密码正确
- 检查网络访问设置

### Q: 图片上传不工作？
- 免费套餐无持久化存储
- 建议使用外部图床（Cloudinary）

---

## 🎯 下一步

部署成功后，你可以：

1. 添加自定义域名
2. 配置评论系统（Giscus）
3. 优化SEO（sitemap.xml）
4. 添加访问统计
5. 配置自动备份

---

**祝你部署成功！🚀**
