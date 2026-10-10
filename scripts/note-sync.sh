#!/bin/bash
# 笔记仓库自动同步脚本：被 GitHub Webhook（/api/webhook/note）触发
# 1. 拉取笔记仓库（稀疏检出，仅 01 - Blog 目录）
# 2. 运行导入脚本，把文章写入 MongoDB

set -e

LOG=/opt/blog/logs/note-sync.log
mkdir -p /opt/blog/logs

WORKDIR=/opt/blog
NOTE_DIR=/opt/note

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }

log "开始同步笔记"

# 1. 拉取笔记仓库（公开仓库，HTTPS；sparse-checkout 保证只落地 01 - Blog）
if [ -d "$NOTE_DIR/.git" ]; then
  cd "$NOTE_DIR"
  log "git fetch + reset --hard origin/main"
  git fetch origin main >> "$LOG" 2>&1
  git reset --hard origin/main >> "$LOG" 2>&1
else
  log "错误：笔记仓库不存在 $NOTE_DIR，请先执行 sparse clone"
  exit 1
fi

log "git 同步完成"

# 2. 导入文章到 MongoDB（OBSIDIAN_VAULT_PATH 指向服务器上的笔记目录）
cd "$WORKDIR"
log "运行 import-from-obsidian.js"
OBSIDIAN_VAULT_PATH="$NOTE_DIR" node scripts/import-from-obsidian.js >> "$LOG" 2>&1

log "✅ 笔记同步完成"