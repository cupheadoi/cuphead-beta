import fs from 'fs';
import path from 'path';

let isSyncing = false;
let lastSyncedAt = null;
let lastSyncError = null;
let lastBlobUrl = null;
let hasInitializedCloud = false;
let tokenAuthFailed = false;

/**
 * Validates if the given token matches standard Vercel Blob tokens.
 * Official Vercel Blob tokens always begin with `vercel_blob_rw_` (or `vercel_blob_r_`).
 */
export function isValidBlobToken(token = process.env.BLOB_READ_WRITE_TOKEN) {
  if (!token || typeof token !== 'string') return false;
  const trimmed = token.trim();
  return trimmed.startsWith('vercel_blob_rw_') || trimmed.startsWith('vercel_blob_');
}

export function hasCloudToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return false;
  if (!isValidBlobToken(token)) return false;
  if (tokenAuthFailed) return false;
  return true;
}

/**
 * Initializes cloud sync on cold start (especially on Vercel).
 * If a valid BLOB_READ_WRITE_TOKEN is set, it checks if a remote cuphead.sqlite exists.
 * If yes, downloads it to local dbPath before queries begin.
 */
export async function initCloudSync(dbPath, onDatabaseUpdated) {
  if (hasInitializedCloud) return;
  hasInitializedCloud = true;

  const rawToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!rawToken) {
    console.log('[CloudSync] No BLOB_READ_WRITE_TOKEN detected. Running in standard local SQLite mode.');
    return;
  }

  if (!isValidBlobToken(rawToken)) {
    console.warn('[CloudSync] BLOB_READ_WRITE_TOKEN is set but does not match Vercel Blob format (must start with vercel_blob_rw_). Disabling cloud sync.');
    lastSyncError = 'مقدار BLOB_READ_WRITE_TOKEN نامعتبر است (باید با vercel_blob_rw_ شروع شود).';
    return;
  }

  try {
    console.log('[CloudSync] Checking remote Vercel Blob for database...');
    const { list } = await import('@vercel/blob');
    const response = await list({ prefix: 'cuphead.sqlite', token: rawToken.trim() });
    const targetBlob = response.blobs.find(b => b.pathname === 'cuphead.sqlite');

    if (targetBlob && targetBlob.url) {
      console.log(`[CloudSync] Found remote database (${targetBlob.size} bytes), downloading from:`, targetBlob.url);
      
      let buffer = null;
      let res = await fetch(targetBlob.url);
      if (res.ok) {
        buffer = Buffer.from(await res.arrayBuffer());
      } else {
        // Try with Authorization header in case the store is Private
        res = await fetch(targetBlob.url, {
          headers: { Authorization: `Bearer ${rawToken.trim()}` }
        });
        if (res.ok) {
          buffer = Buffer.from(await res.arrayBuffer());
        } else {
          // Try through blob get helper
          const { get } = await import('@vercel/blob');
          const blobResult = await get(targetBlob.pathname, { access: 'private', token: rawToken.trim() });
          if (blobResult && blobResult.stream) {
            buffer = Buffer.from(await new Response(blobResult.stream).arrayBuffer());
          }
        }
      }

      if (!buffer || buffer.length === 0) {
        throw new Error(`Failed to download blob content (HTTP status: ${res?.status})`);
      }

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
    const msg = err?.message || String(err);
    if (err?.name === 'BlobAccessError' || msg.includes('Access denied') || msg.includes('token')) {
      tokenAuthFailed = true;
      lastSyncError = 'دسترسی Vercel Blob رد شد: توکن نامعتبر است یا منقضی شده است.';
      console.warn('[CloudSync] Access denied by Vercel Blob. Cloud sync disabled. Running with local SQLite.');
    } else {
      lastSyncError = msg;
      console.error('[CloudSync] Failed to initialize from Vercel Blob:', msg);
    }
  }
}

/**
 * Uploads local SQLite file to Vercel Blob.
 * Tries public access first; if private store, automatically falls back to private access.
 */
export async function pushDatabaseToCloud(dbPath) {
  const rawToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!rawToken) return { ok: false, message: 'BLOB_READ_WRITE_TOKEN is not configured.' };
  if (!isValidBlobToken(rawToken)) {
    return { ok: false, error: 'مقدار BLOB_READ_WRITE_TOKEN معتبر نیست (باید با vercel_blob_rw_ شروع شود).' };
  }
  if (tokenAuthFailed) {
    return { ok: false, error: 'دسترسی Vercel Blob قبلاً رد شده است (Access denied).' };
  }
  if (!fs.existsSync(dbPath)) return { ok: false, message: 'Local database file not found.' };

  if (isSyncing) {
    return { ok: true, message: 'Sync already in progress.' };
  }

  isSyncing = true;

  try {
    const { put } = await import('@vercel/blob');
    const fileBuffer = fs.readFileSync(dbPath);
    console.log(`[CloudSync] Uploading ${fileBuffer.length} bytes to Vercel Blob...`);

    let blob;
    try {
      blob = await put('cuphead.sqlite', fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: rawToken.trim(),
      });
    } catch (putErr) {
      // If store was created as Private, retry with access: 'private'
      const putErrMsg = String(putErr?.message || '').toLowerCase();
      if (putErrMsg.includes('private') || putErrMsg.includes('access') || putErrMsg.includes('public')) {
        blob = await put('cuphead.sqlite', fileBuffer, {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          token: rawToken.trim(),
        });
      } else {
        throw putErr;
      }
    }

    lastSyncedAt = new Date().toISOString();
    lastBlobUrl = blob.url;
    lastSyncError = null;
    console.log('[CloudSync] Upload complete. Blob URL:', blob.url);
    return { ok: true, url: blob.url, syncedAt: lastSyncedAt };
  } catch (err) {
    const msg = err?.message || String(err);
    if (err?.name === 'BlobAccessError' || msg.includes('Access denied') || msg.includes('token')) {
      tokenAuthFailed = true;
      lastSyncError = 'دسترسی Vercel Blob رد شد: کلید واردشده نامعتبر است.';
      console.warn('[CloudSync] Access denied while pushing database to Vercel Blob.');
    } else {
      lastSyncError = msg;
      console.error('[CloudSync] Push error:', msg);
    }
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
    if (!hasCloudToken()) return;
    pushDatabaseToCloud(dbPath).catch(err => {
      console.error('[CloudSync] Debounced push error:', err?.message || err);
    });
  }, delayMs);
}

export function getCloudSyncStatus(dbPath) {
  const stat = fs.existsSync(dbPath) ? fs.statSync(dbPath) : null;
  const rawToken = process.env.BLOB_READ_WRITE_TOKEN;
  const hasRawToken = Boolean(rawToken && String(rawToken).trim().length > 0);
  const tokenValid = isValidBlobToken(rawToken);

  let formattedError = lastSyncError;
  if (hasRawToken && !tokenValid) {
    formattedError = 'کلید وارد شده با فرمت استاندارد Vercel Blob همخوانی ندارد. توکن Vercel Blob باید با vercel_blob_rw_ آغاز شود.';
  }

  return {
    hasToken: hasRawToken,
    tokenValid,
    tokenAuthFailed,
    enabled: hasCloudToken(),
    provider: hasCloudToken() ? 'vercel-blob' : 'local-sqlite',
    lastSyncedAt,
    lastSyncError: formattedError,
    lastBlobUrl,
    isSyncing,
    localFileSize: stat ? stat.size : 0
  };
}
