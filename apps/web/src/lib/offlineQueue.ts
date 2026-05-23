/**
 * @file offlineQueue.ts
 * @description IndexedDB wrapper for offline score queuing.
 * DB: 'zenith-offline', store: 'scoreQueue'.
 */

export interface QueuedScore {
  id: string;
  endpoint: string;
  payload: Record<string, number>;
  queuedAt: number;
  retries: number;
}

const DB_NAME = 'zenith-offline';
const STORE_NAME = 'scoreQueue';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Enqueues a score submission for later sync.
 */
export const enqueue = async (score: Omit<QueuedScore, 'queuedAt' | 'retries'>): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const entry: QueuedScore = {
    ...score,
    queuedAt: Date.now(),
    retries: 0,
  };

  return new Promise((resolve, reject) => {
    const request = store.add(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Dequeues all pending score submissions.
 */
export const dequeueAll = async (): Promise<QueuedScore[]> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Removes a specific queued score by ID.
 */
export const remove = async (id: string): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Updates a queued score entry (e.g., increment retries).
 */
export const update = async (score: QueuedScore): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.put(score);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Returns the count of pending queued scores.
 */
export const getCount = async (): Promise<number> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
