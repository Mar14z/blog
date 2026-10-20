#!/bin/bash
# 博客数据备份：MongoDB 的 blog 库 + uploads 目录，保留 7 天。
# 由 cron 每日执行：0 4 * * * /opt/blog/scripts/backup.sh

set -euo pipefail

BACKUP_DIR=/opt/backup
UPLOAD_DIR=/opt/blog/uploads
LOG_DIR=/opt/blog/logs
KEEP_DAYS=7
STAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR" "$LOG_DIR"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/backup.log"; }

log "开始备份 $STAMP"

# 1. 数据库：先 dump 到临时目录，再压缩成单文件
DUMP_DIR="$BACKUP_DIR/mongo-$STAMP"
mongodump --quiet --db blog --out "$DUMP_DIR" >> "$LOG_DIR/backup.log" 2>&1
tar -czf "$BACKUP_DIR/mongo-$STAMP.tar.gz" -C "$BACKUP_DIR" "mongo-$STAMP"
rm -rf "$DUMP_DIR"

# 2. 上传文件（相册与封面）
tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"

# 3. 清理过期备份
find "$BACKUP_DIR" -maxdepth 1 -name '*.tar.gz' -mtime +"$KEEP_DAYS" -delete

log "备份完成 mongo-$STAMP.tar.gz / uploads-$STAMP.tar.gz，当前占用 $(du -sh "$BACKUP_DIR" | cut -f1)"
