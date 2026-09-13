import app, { ensureCloudSyncReady } from '../server/server.js';

export default async function handler(req, res) {
  if (ensureCloudSyncReady) {
    try {
      await ensureCloudSyncReady();
    } catch (err) {
      console.error('[Vercel Handler] Cloud sync check failed:', err);
    }
  }
  return app(req, res);
}
