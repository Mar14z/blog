# 自动部署（GitHub Webhook）

> 推送 GitHub 后，服务器自动 `git pull` + `pm2 restart`。

***

## 工作原理

```
本地 git push → GitHub → POST /api/webhook/github → 服务器
                                                  ↓
                                       校验签名 + 分支名
                                                  ↓
                                       spawn scripts/deploy.sh（后台执行）
                                                  ↓
                                       git pull → npm ci → pm2 restart → 健康检查
                                                  ↓
                                              完成
```

***

## 服务器一次性配置

### 1. 生成专用 SSH key（只读）

服务器已生成（密钥路径 `~/.ssh/blog_deploy_key`）。

公钥（你需要复制到 GitHub）：

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHsirZ8MTitfNQSYSetIg0zu20ZCtqNt9C66As8taTWn blog-deploy-key
```

### 2. GitHub 仓库加 Deploy Key

访问 <https://github.com/Mar14z/blog/settings/keys/new>

- Title: `blog-server-deploy`

- Key: 粘贴上面公钥

- ✅ Allow write access: **不要勾选**（只读够用）

- 点击 Add key

### 3. 服务器 `.env` 增加 `WEBHOOK_SECRET`

在服务器 `/opt/blog/.env` 加一行：

```
WEBHOOK_SECRET=一个强随机字符串
```

例如 `openssl rand -hex 32` 生成。把同样的字符串填到 GitHub Webhook 配置（下一步）。

### 4. 改服务器仓库 remote 为 SSH

服务器上 `/opt/blog` 的 `.git/config` 中 `origin` 应改为：

```
[remote "origin"]
    url = git@github.com:Mar14z/blog.git
    fetch = +refs/heads/*:refs/remotes/origin/*
```

HTTPS 也能拉，但 SSH 更稳（不受端口影响）。服务器已可连 GitHub SSH（仅需 deploy key 验证）。

### 5. 首次同步（仅第一次需要）

如果服务器 `/opt/blog` 之前的提交和 GitHub 不一致，先：

```bash
cd /opt/blog
GIT_SSH_COMMAND="ssh -i ~/.ssh/blog_deploy_key -o StrictHostKeyChecking=yes" \
  git fetch origin
GIT_SSH_COMMAND="ssh -i ~/.ssh/blog_deploy_key -o StrictHostKeyChecking=yes" \
  git reset --hard origin/master
```

***

## GitHub Webhook 配置

访问 <https://github.com/Mar14z/blog/settings/hooks/new>

- Payload URL: `http://jingmo.dev/api/webhook/github`（或服务器 IP）

- Content type: `application/json`

- Secret: 填 `.env` 里 `WEBHOOK_SECRET` 同样的字符串

- SSL verification: Enable（如果是 https）

- Which events: **Just the push event.**

- Active: ✅

- 点击 Add webhook

***

## 测试

1. 在本地修改一个文件 → commit → push
2. GitHub 仓库 Settings → Webhooks → Recent Deliveries 应该有 200 响应
3. 服务器日志：`tail -f /opt/blog/logs/deploy.log`
4. `pm2 list` 看 uptime 是否接近当前时间

如果 webhook 返回 401，检查 `WEBHOOK_SECRET` 两边是否一致。

***

## 安全

- Webhook 路径 `/api/webhook/github` 不需要 token，但有 HMAC 签名校验

- Deploy key 是只读，服务器无法 push 到 GitHub

- Webhook secret 必须 ≥ 32 字符随机

- 如果服务器被攻陷，攻击者最多只能重启服务（不暴露数据库文件本身）

***

## 不使用 webhook 的回退

如果 webhook 失灵，老办法：

```powershell
# 本地
git push origin master
scp <changed files> ubuntu@161.33.26.40:/opt/blog/...
ssh ubuntu@161.33.26.40 "pm2 restart blog"
```

