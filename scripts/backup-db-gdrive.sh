#!/bin/bash
# ============================================================
# Shohnaat Logistics — Automated Database Backup & Google Drive Sync
# ============================================================
# Usage:
#   bash scripts/backup-db-gdrive.sh
# Add to crontab for daily 2:00 AM backup:
#   0 2 * * * /bin/bash /home/rahimbadsa723/shohnaat-logistics/scripts/backup-db-gdrive.sh >> /var/log/shohnaat-backup.log 2>&1
# ============================================================

set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="/home/rahimbadsa723/shohnaat-logistics/backups"
BACKUP_FILE="shohnaat_db_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="shohnaat-db"
DB_NAME="${POSTGRES_DB:-shohnaat}"
DB_USER="${POSTGRES_USER:-admin}"
GDRIVE_REMOTE="gdrive:shohnaat-backups"


# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "=================================================="
echo "📦 Starting PostgreSQL Backup: ${TIMESTAMP}"
echo "=================================================="

# 1. Take pg_dump from Docker container and compress with gzip level 9
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip -9 > "${BACKUP_DIR}/${BACKUP_FILE}"

SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
echo "✅ Local Backup created: ${BACKUP_DIR}/${BACKUP_FILE} (${SIZE})"

# 2. Upload to Google Drive via rclone (if configured)
if command -v rclone &> /dev/null; then
    echo "☁️ Uploading to Google Drive (${GDRIVE_REMOTE})..."
    rclone copy "${BACKUP_DIR}/${BACKUP_FILE}" "${GDRIVE_REMOTE}"
    echo "✅ Google Drive sync complete!"
else
    echo "ℹ️  rclone not installed. Local backup saved. (Install rclone for direct Google Drive sync)"
fi

# 3. Retain last 14 days locally (delete older than 14 days)
find "$BACKUP_DIR" -type f -name "shohnaat_db_*.sql.gz" -mtime +14 -exec rm {} \;
echo "🧹 Pruned local backups older than 14 days."
echo "🎉 Backup job finished successfully!"
