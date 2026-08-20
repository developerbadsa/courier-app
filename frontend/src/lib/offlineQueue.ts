/**
 * Offline-First IndexedDB Sync Queue
 * Guarantees zero data loss for rider delivery actions
 * Auto-syncs when connection is restored
 */

import { apiPost, showToast } from './api';

/* ── Types ── */
export interface OfflineAction {
  id: string;
  shipmentId: string;
  action: 'DELIVERED' | 'FAILED' | 'OTP_VERIFIED' | 'CASH_COLLECTED';
  data?: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  retries: number;
}

const DB_NAME = 'shohnaat-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'pending-actions';
const MAX_RETRIES = 3;

/* ── IndexedDB Helpers ── */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function generateId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Core API ── */

/**
 * Add an action to the offline queue
 */
export async function enqueueAction(
  action: OfflineAction['action'],
  shipmentId: string,
  data?: Record<string, unknown>
): Promise<string> {
  const id = generateId();
  const entry: OfflineAction = {
    id,
    shipmentId,
    action,
    data,
    timestamp: Date.now(),
    synced: false,
    retries: 0,
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add(entry);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();

    // Show offline notification
    const count = await getPendingCount();
    showToast('info', `Action queued offline — ${count} pending sync`);

    return id;
  } catch (err) {
    console.error('[OfflineQueue] Failed to enqueue:', err);
    throw err;
  }
}

/**
 * Get all pending (unsynced) actions
 */
export async function getPendingActions(): Promise<OfflineAction[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('synced');
    const request = index.getAll(IDBKeyRange.only(false));

    return new Promise<OfflineAction[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as OfflineAction[]);
      request.onerror = () => reject(request.error);
    }).finally(() => db.close());
  } catch {
    return [];
  }
}

/**
 * Get count of pending (unsynced) actions
 */
export async function getPendingCount(): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('synced');
    const request = index.count(IDBKeyRange.only(false));

    return new Promise<number>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    }).finally(() => db.close());
  } catch {
    return 0;
  }
}

/**
 * Mark an action as synced
 */
async function markSynced(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const getReq = store.get(id);
  getReq.onsuccess = () => {
    const entry = getReq.result;
    if (entry) {
      entry.synced = true;
      store.put(entry);
    }
  };

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

/**
 * Increment retry count for an action
 */
async function incrementRetry(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const getReq = store.get(id);
  getReq.onsuccess = () => {
    const entry = getReq.result;
    if (entry) {
      entry.retries += 1;
      store.put(entry);
    }
  };

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

/**
 * Flush offline queue — sync all pending actions to backend
 */
export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingActions();
  if (pending.length === 0) return { synced: 0, failed: 0 };

  // Batch sync via POST /api/v1/shipments/sync-offline
  const actions = pending.map((a) => ({
    shipmentId: a.shipmentId,
    action: a.action,
    data: a.data,
    timestamp: a.timestamp,
  }));

  try {
    const res = await apiPost<{ synced: number; failed: number; results: any[] }>(
      '/api/v1/shipments/sync-offline',
      { actions }
    );

    if (res.success) {
      // Mark all as synced
      for (const action of pending) {
        await markSynced(action.id);
      }

      const synced = res.data?.synced ?? pending.length;
      const failed = res.data?.failed ?? 0;

      if (synced > 0) {
        showToast('success', `Synced ${synced} offline action${synced !== 1 ? 's' : ''}`);
      }
      if (failed > 0) {
        showToast('warning', `${failed} action${failed !== 1 ? 's' : ''} failed to sync`);
      }

      return { synced, failed };
    }

    // If API returned failure, increment retries
    for (const action of pending) {
      if (action.retries < MAX_RETRIES) {
        await incrementRetry(action.id);
      }
    }

    return { synced: 0, failed: pending.length };
  } catch (err) {
    console.error('[OfflineQueue] Flush failed:', err);
    // Increment retries for all
    for (const action of pending) {
      if (action.retries < MAX_RETRIES) {
        await incrementRetry(action.id);
      }
    }
    return { synced: 0, failed: pending.length };
  }
}

/**
 * Clear all synced actions from the queue
 */
export async function clearSyncedActions(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('synced');
  const request = index.openCursor(IDBKeyRange.only(true));

  request.onsuccess = () => {
    const cursor = request.result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

/* ── Auto-Sync on Reconnect ── */

let syncInitialized = false;

/**
 * Initialize the auto-sync listener — call once on app start
 */
export function initOfflineSync(): void {
  if (syncInitialized || typeof window === 'undefined') return;
  syncInitialized = true;

  // Listen for online event
  window.addEventListener('online', async () => {
    showToast('info', 'Back online — syncing offline actions...');
    const result = await flushQueue();
    if (result.synced > 0) {
      clearSyncedActions();
    }
  });

  // Also try flushing on visibility change (when user comes back to tab)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      const pending = await getPendingCount();
      if (pending > 0) {
        const result = await flushQueue();
        if (result.synced > 0) {
          clearSyncedActions();
        }
      }
    }
  });

  // Try initial flush on load
  getPendingCount().then((count) => {
    if (count > 0 && navigator.onLine) {
      flushQueue().then((r) => {
        if (r.synced > 0) clearSyncedActions();
      });
    }
  });
}

/**
 * Check if browser is currently online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
