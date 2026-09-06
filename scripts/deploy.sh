#!/bin/bash
# 自动部署脚本：被 webhook 触发执行
# 工作目录必须是 /opt/blog

set -e

LOG=/opt/blog/logs/deploy.log
mkdir -p /opt/blog/logs

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始部署" >> "$LOG"

cd /opt/blog

# 1. git pull（强制同步到 origin/master，丢弃本地差异）
echo "[$(date '+%Y-%m-%d %H:%M:%S')] git reset --hard origin/master..." >> "$LOG"
GIT_SSH_COMMAND="ssh -i ~/.ssh/blog_deploy_key -o StrictHostKeyChecking=yes" \
  git fetch origin master >> "$LOG" 2>&1
GIT_SSH_COMMAND="ssh -i ~/.ssh/blog_deploy_key -o StrictHostKeyChecking=yes" \
  git reset --hard origin/master >> "$LOG" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] git 同步完成" >> "$LOG"

# 2. 同步 .env（本地不提交，由 scp 推送；这里只是兜底）
if [ ! -f .env ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: .env 不存在" >> "$LOG"
fi

# 3. 安装新依赖（如果有）
if [ -f package.json ]; then
  # 检查 lock 是否变了（粗略判断）
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检查依赖..." >> "$LOG"
  # npm install 太重，用生产安装且跳过 scripts，避免触发 husky 等
  npm ci --omit=dev --ignore-scripts >> "$LOG" 2>&1 || npm install --omit=dev --ignore-scripts >> "$LOG" 2>&1
fi

# 4. 重启 PM2
echo "[$(date '+%Y-%m-%d %H:%M:%S')] pm2 restart blog..." >> "$LOG"
pm2 restart blog >> "$LOG" 2>&1

# 5. 健康检查
sleep 2
if curl -sf http://127.0.0.1:3000/api/health > /dev/null; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 部署成功，健康检查通过" >> "$LOG"
  exit 0
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 健康检查失败" >> "$LOG"
  exit 1
fi
