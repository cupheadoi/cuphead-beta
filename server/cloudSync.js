import fs from 'fs';
import path from 'path';

let isSyncing = false;
let lastSyncedAt = null;
let lastSyncError = null;
let lastBlobUrl = null;
let hasInitializedCloud = false;

export function hasCloudToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Initializes cloud sync on cold start (especially on Vercel).
 * If BLOB_READ_WRITE_TOKEN is set, it checks if a remote cuphead.sqlite exists.
 * If yes, downloads it to local dbPath before queries begin.
 */
export async function initCloudSync(dbPath, onDatabaseUpdated) {
  if (hasInitializedCloud) return;
  hasInitializedCloud = true;

  if (!hasCloudToken()) {
    console.log('[CloudSync] No BLOB_READ_WRITE_TOKEN detected. Running in standard local SQLite mode.');
    return;
  }

  try {
    console.log('[CloudSync] Checking remote Vercel Blob for database...');
    const { list } = await import('@vercel/blob');
    const response = await list({ prefix: 'cuphead.sqlite' });
    const targetBlob = response.blobs.find(b => b.pathname === 'cuphead.sqlite');

    if (targetBlob && targetBlob.url) {
      console.log(`[CloudSync] Found remote database (${targetBlob.size} bytes), downloading from:`, targetBlob.url);
      const res = await fetch(targetBlob.url);
      if (!res.ok) throw new Error(`HTTP error downloading blob: ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, buffer);
      lastSyncedAt = new Date().toISOString();
      lastBlobUrl = targetBlob.url;
      console.log('[CloudSync] Successfully downloaded and restored database from Vercel Blob.');

      if (typeof onDatabaseUpdated === 'function') {
        onDatabaseUpdated();
      }
    } else {
      console.log('[CloudSync] No remote database found in Blob yet. Uploading local seed database...');
      if (fs.existsSync(dbPath)) {
        await pushDatabaseToCloud(dbPath);
      }
    }
  } catch (err) {
    console.error('[CloudSync] Failed to initialize from Vercel Blob:', err);
    lastSyncError = err.message || String(err);
  }
}

/**
 * Uploads local SQLite file to Vercel Blob.
 */
export async function pushDatabaseToCloud(dbPath) {
  if (!hasCloudToken()) return { ok: false, message: 'BLOB_READ_WRITE_TOKEN is not configured.' };
  if (!fs.existsSync(dbPath)) return { ok: false, message: 'Local database file not found.' };

  if (isSyncing) {
    return { ok: true, message: 'Sync already in progress.' };
  }

  isSyncing = true;
  lastSyncError = null;

  try {
    const { put } = await import('@vercel/blob');
    const fileBuffer = fs.readFileSync(dbPath);
    console.log(`[CloudSync] Uploading ${fileBuffer.length} bytes to Vercel Blob...`);

    const blob = await put('cuphead.sqlite', fileBuffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    lastSyncedAt = new Date().toISOString();
    lastBlobUrl = blob.url;
    console.log('[CloudSync] Upload complete. Blob URL:', blob.url);
    return { ok: true, url: blob.url, syncedAt: lastSyncedAt };
  } catch (err) {
    console.error('[CloudSync] Push error:', err);
    lastSyncError = err.message || String(err);
    return { ok: false, error: lastSyncError };
  } finally {
    isSyncing = false;
  }
}

let debouncedTimer = null;

/**
 * Schedules a background sync after a database mutation.
 */
export function scheduleCloudSync(dbPath, delayMs = 2500) {
  if (!hasCloudToken()) return;
  if (debouncedTimer) clearTimeout(debouncedTimer);

  debouncedTimer = setTimeout(() => {
    pushDatabaseToCloud(dbPath).catch(err => {
      console.error('[CloudSync] Debounced push error:', err);
    });
  }, delayMs);
}

export function getCloudSyncStatus(dbPath) {
  const stat = fs.existsSync(dbPath) ? fs.statSync(dbPath) : null;
  return {
    hasToken: hasCloudToken(),
    enabled: hasCloudToken(),
    provider: hasCloudToken() ? 'vercel-blob' : 'local-sqlite',
    lastSyncedAt,
    lastSyncError,
    lastBlobUrl,
    isSyncing,
    localFileSize: stat ? stat.size : 0
  };
}
