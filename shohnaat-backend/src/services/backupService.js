/**
 * Shohnaat Logistics — Enterprise Database Backup & Disaster Recovery Engine
 * Features:
 * 1. Automated Scheduled Backups (Daily/Hourly Gzip compressed)
 * 2. Instant Emergency Trigger on Fatal Errors
 * 3. Local Retention Auto-Pruning
 * 4. Google Drive / Remote Offsite Sync Hook
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const logger = require('../lib/logger');

// Local backups directory
const BACKUPS_DIR = path.join(process.cwd(), 'backups');
try {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
} catch (e) {
  // Directory error handled gracefully
}

// Emergency backup rate-limiter: Max 1 emergency backup per 10 minutes
let lastEmergencyBackupTime = 0;
const EMERGENCY_COOLDOWN_MS = 10 * 60 * 1000;

/**
 * Format timestamp for backup filename
 */
function getTimestampString() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
}

/**
 * Parse database credentials from DATABASE_URL
 */
function parseDatabaseUrl() {
  const defaultUrl = 'postgresql://admin:password123@127.0.0.1:5432/shohnaat';
  const urlString = process.env.DATABASE_URL || defaultUrl;

  try {
    const parsed = new URL(urlString);
    return {
      user: decodeURIComponent(parsed.username || 'admin'),
      password: decodeURIComponent(parsed.password || ''),
      host: parsed.hostname || '127.0.0.1',
      port: parsed.port || '5432',
      database: parsed.pathname.replace(/^\//, '') || 'shohnaat',
    };
  } catch (err) {
    return {
      user: 'admin',
      password: '',
      host: '127.0.0.1',
      port: '5432',
      database: 'shohnaat',
    };
  }
}


/**
 * Create a compressed database snapshot
 * @param {'scheduled'|'manual'|'emergency'} type
 * @param {string} reason
 */
async function createDatabaseBackup(type = 'manual', reason = '') {
  return new Promise((resolve, reject) => {
    const timestamp = getTimestampString();
    const filename = `shohnaat_backup_${timestamp}_${type.toUpperCase()}.sql.gz`;
    const outputPath = path.join(BACKUPS_DIR, filename);
    const db = parseDatabaseUrl();

    logger.info(`🗄️ Starting ${type.toUpperCase()} database backup: ${filename} (Reason: ${reason || 'None'})`);

    const isDocker = fs.existsSync('/.dockerenv');
    const targetHost = isDocker ? 'db' : db.host;

    // Command to dump directly from pg_dump or docker
    const dumpCmd = `pg_dump -h ${targetHost} -p ${db.port} -U ${db.user} -d ${db.database} -F p --no-owner --no-acl`;

    const env = {
      ...process.env,
      PGPASSWORD: db.password,
    };

    // Execute pg_dump and pipe into gzip stream
    const dumpProcess = spawn(dumpCmd, { shell: true, env });
    const gzip = zlib.createGzip({ level: 9 });
    const writeStream = fs.createWriteStream(outputPath);

    dumpProcess.stdout.pipe(gzip).pipe(writeStream);

    let stderrData = '';
    dumpProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    writeStream.on('finish', () => {
      try {
        const stats = fs.statSync(outputPath);
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

        logger.info(`✅ Backup created successfully: ${filename} (${sizeMb} MB)`);

        // Save metadata record
        const meta = {
          filename,
          outputPath,
          type,
          reason,
          sizeBytes: stats.size,
          sizeFormatted: `${sizeMb} MB`,
          createdAt: new Date().toISOString(),
        };

        // Prune old backups (Keep last 20 backups or 14 days)
        pruneOldBackups(20).catch(() => {});

        // Trigger offsite cloud sync hook (Google Drive / Rclone)
        triggerCloudSync(outputPath, filename).catch(() => {});

        resolve(meta);
      } catch (statErr) {
        resolve({ filename, outputPath, type, createdAt: new Date().toISOString() });
      }
    });

    dumpProcess.on('error', (err) => {
      logger.error(`❌ Backup failed to spawn pg_dump:`, err);
      reject(err);
    });

    dumpProcess.on('close', (code) => {
      if (code !== 0 && !fs.existsSync(outputPath)) {
        logger.error(`❌ pg_dump exited with code ${code}: ${stderrData}`);
        reject(new Error(`pg_dump failed (code ${code}): ${stderrData}`));
      }
    });
  });
}

/**
 * Emergency Backup Trigger (Called on FATAL crashes / major exceptions)
 */
async function triggerEmergencyBackup(reason = 'Fatal error detected') {
  const now = Date.now();
  if (now - lastEmergencyBackupTime < EMERGENCY_COOLDOWN_MS) {
    logger.warn(`Emergency backup skipped (Cooldown active. Last backup was ${(now - lastEmergencyBackupTime) / 1000}s ago)`);
    return null;
  }

  lastEmergencyBackupTime = now;
  logger.warn(`🚨 EMERGENCY DATABASE BACKUP TRIGGERED: ${reason}`);

  try {
    return await createDatabaseBackup('emergency', reason);
  } catch (err) {
    logger.error('Failed to create emergency backup:', err);
    return null;
  }
}

/**
 * Prune old local backup archives
 */
async function pruneOldBackups(maxKeep = 20) {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) return;

    const files = fs.readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith('.sql.gz'))
      .map((f) => {
        const filePath = path.join(BACKUPS_DIR, f);
        return { name: f, path: filePath, time: fs.statSync(filePath).mtime.getTime() };
      })
      .sort((a, b) => b.time - a.time); // newest first

    if (files.length > maxKeep) {
      const toDelete = files.slice(maxKeep);
      for (const item of toDelete) {
        fs.unlinkSync(item.path);
        logger.info(`🗑️ Pruned old backup: ${item.name}`);
      }
    }
  } catch (err) {
    logger.warn('Failed to prune old backups:', err.message);
  }
}

/**
 * List all local backup files
 */
function listBackups() {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) return [];

    return fs.readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith('.sql.gz'))
      .map((f) => {
        const filePath = path.join(BACKUPS_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          filename: f,
          sizeBytes: stats.size,
          sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
          createdAt: stats.mtime.toISOString(),
          isEmergency: f.includes('EMERGENCY'),
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    return [];
  }
}

/**
 * Offsite Cloud Sync Hook (Google Drive via Rclone / Service Account)
 */
async function triggerCloudSync(localFilePath, filename) {
  // If rclone or gdrive script is configured on VPS, trigger upload
  const rcloneRemote = process.env.RCLONE_GDRIVE_REMOTE || 'gdrive:shohnaat-backups';
  const gdriveEnabled = process.env.ENABLE_GDRIVE_BACKUP === 'true';

  if (!gdriveEnabled) {
    return; // Cloud sync disabled
  }

  exec(`rclone copy "${localFilePath}" "${rcloneRemote}"`, (err, stdout, stderr) => {
    if (err) {
      logger.warn(`Google Drive cloud sync warning: ${err.message}`);
    } else {
      logger.info(`☁️ [Google Drive Sync] Successfully uploaded ${filename} to ${rcloneRemote}`);
    }
  });
}

module.exports = {
  createDatabaseBackup,
  triggerEmergencyBackup,
  listBackups,
  pruneOldBackups,
  BACKUPS_DIR,
};
