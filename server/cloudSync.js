import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATABASE_BLOB = 'cuphead.sqlite';
const DATABASE_LOCK = 'cuphead.sqlite.lock';
const LOCK_TTL_MS = 30_000;
const LOCK_WAIT_MS = 15_000;

let initializationPromise = null;
let initializedThisInstance = false;
let lastSyncedAt = null;
let lastSyncError = null;
let lastBlobUrl = null;
let tokenAuthFailed = false;

export function isValidBlobToken(token = process.env.BLOB_READ_WRITE_TOKEN) {
  return typeof token === 'string' && token.trim().startsWith('vercel_blob_');
}

export function hasCloudToken() {
  return isValidBlobToken() && !tokenAuthFailed;
}

const token = () => String(process.env.BLOB_READ_WRITE_TOKEN || '').trim();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const isMissing = error => error?.statusCode === 404 || /not found|does not exist/i.test(String(error?.message || error));
const isConflict = error => error?.statusCode === 409 || /already exists|precondition|conflict/i.test(String(error?.message || error));

async function acquireDatabaseLock() {
  const { put, head, del } = await import('@vercel/blob');
  const deadline = Date.now() + LOCK_WAIT_MS;
  while (Date.now() < deadline) {
    try {
      const lock = await put(DATABASE_LOCK, JSON.stringify({ id: crypto.randomUUID(), createdAt: Date.now() }), {
        access: 'private', addRandomSuffix: false, contentType: 'application/json', token: token(),
      });
      return { pathname: lock.pathname, etag: lock.etag };
    } catch (error) {
      if (!isConflict(error)) throw error;
      try {
        const current = await head(DATABASE_LOCK, { token: token() });
        const uploadedAt = new Date(current.uploadedAt || 0).getTime();
        if (uploadedAt && Date.now() - uploadedAt > LOCK_TTL_MS) {
          await del(DATABASE_LOCK, { token: token(), ifMatch: current.etag });
          continue;
        }
      } catch (headError) {
        if (!isMissing(headError) && !isConflict(headError)) throw headError;
      }
      await pause(150 + Math.floor(Math.random() * 100));
    }
  }
  throw new Error('Database is busy. Please retry the request.');
}

async function releaseDatabaseLock(lock) {
  if (!lock) return;
  const { del } = await import('@vercel/blob');
  try {
    await del(lock.pathname, { token: token(), ifMatch: lock.etag });
  } catch (error) {
    console.warn('[CloudDB] Lock release failed:', error?.message || error);
  }
}

async function readRemoteDatabase(dbPath, onDatabaseUpdated) {
  const { get, head } = await import('@vercel/blob');
  let metadata;
  try {
    metadata = await head(DATABASE_BLOB, { token: token() });
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
  const remote = await get(DATABASE_BLOB, { access: 'private', token: token() });
  if (!remote?.stream) throw new Error('The private database blob could not be read.');
  const buffer = Buffer.from(await new Response(remote.stream).arrayBuffer());
  if (buffer.length < 16 || buffer.subarray(0, 16).toString('utf8') !== 'SQLite format 3\0') {
    throw new Error('The remote database blob is not a valid SQLite database.');
  }
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, buffer);
  if (typeof onDatabaseUpdated === 'function') onDatabaseUpdated();
  lastSyncedAt = new Date().toISOString();
  lastBlobUrl = metadata.url || null;
  return { etag: metadata.etag };
}

async function writeRemoteDatabase(dbPath, expectedEtag = null) {
  const { put } = await import('@vercel/blob');
  if (!fs.existsSync(dbPath)) throw new Error('Local database file not found.');
  const options = {
    access: 'private', addRandomSuffix: false, contentType: 'application/vnd.sqlite3', token: token(),
  };
  if (expectedEtag) {
    options.allowOverwrite = true;
    options.ifMatch = expectedEtag;
  }
  const blob = await put(DATABASE_BLOB, fs.readFileSync(dbPath), options);
  lastSyncedAt = new Date().toISOString();
  lastBlobUrl = blob.url;
  lastSyncError = null;
  return { etag: blob.etag, url: blob.url };
}

export async function beginCloudDatabaseRequest(dbPath, onDatabaseUpdated) {
  if (!hasCloudToken()) return null;
  const lock = await acquireDatabaseLock();
  try {
    let remote = await readRemoteDatabase(dbPath, onDatabaseUpdated);
    if (!remote) remote = await writeRemoteDatabase(dbPath);
    if (!initializedThisInstance) {
      remote = await writeRemoteDatabase(dbPath, remote.etag);
      initializedThisInstance = true;
    }
    return { lock, databaseEtag: remote.etag };
  } catch (error) {
    await releaseDatabaseLock(lock);
    throw error;
  }
}

export async function finishCloudDatabaseRequest(dbPath, lease, mutated) {
  if (!lease) return;
  try {
    if (mutated) await writeRemoteDatabase(dbPath, lease.databaseEtag);
  } finally {
    await releaseDatabaseLock(lease.lock);
  }
}

export async function initCloudSync(dbPath, onDatabaseUpdated) {
  if (!hasCloudToken()) return;
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const lease = await beginCloudDatabaseRequest(dbPath, onDatabaseUpdated);
      await finishCloudDatabaseRequest(dbPath, lease, false);
    })().catch(error => {
      initializationPromise = null;
      lastSyncError = error?.message || String(error);
      throw error;
    });
  }
  return initializationPromise;
}

export async function pushDatabaseToCloud(dbPath) {
  if (!hasCloudToken()) return { ok: false, error: 'A valid BLOB_READ_WRITE_TOKEN is required.' };
  const lock = await acquireDatabaseLock();
  try {
    const { head } = await import('@vercel/blob');
    let etag = null;
    try { etag = (await head(DATABASE_BLOB, { token: token() })).etag; } catch (error) { if (!isMissing(error)) throw error; }
    const result = await writeRemoteDatabase(dbPath, etag);
    return { ok: true, url: result.url, syncedAt: lastSyncedAt };
  } catch (error) {
    lastSyncError = error?.message || String(error);
    return { ok: false, error: lastSyncError };
  } finally {
    await releaseDatabaseLock(lock);
  }
}

export async function putCloudUpload(buffer, storedName, contentType) {
  const { put } = await import('@vercel/blob');
  return put(`uploads/${storedName}`, buffer, {
    access: 'private', addRandomSuffix: true, contentType, token: token(),
  });
}

export async function getCloudUpload(pathname) {
  if (!String(pathname).startsWith('uploads/')) throw new Error('Invalid upload path.');
  const { get, head } = await import('@vercel/blob');
  const [blob, metadata] = await Promise.all([
    get(pathname, { access: 'private', token: token() }),
    head(pathname, { token: token() }),
  ]);
  if (!blob?.stream) throw new Error('Upload not found.');
  return {
    buffer: Buffer.from(await new Response(blob.stream).arrayBuffer()),
    contentType: metadata.contentType || 'application/octet-stream',
  };
}

export async function deleteCloudUpload(pathname) {
  if (!String(pathname).startsWith('uploads/')) return;
  const { del } = await import('@vercel/blob');
  await del(pathname, { token: token() });
}

export function scheduleCloudSync() {}

export function getCloudSyncStatus(dbPath) {
  const stat = fs.existsSync(dbPath) ? fs.statSync(dbPath) : null;
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return {
    hasToken: configured,
    tokenValid: isValidBlobToken(),
    tokenAuthFailed,
    enabled: hasCloudToken(),
    provider: hasCloudToken() ? 'vercel-private-blob-serialized-sqlite' : 'local-sqlite',
    lastSyncedAt, lastSyncError, lastBlobUrl, isSyncing: false, localFileSize: stat?.size || 0,
  };
}
