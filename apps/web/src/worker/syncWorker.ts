/**
 * @file syncWorker.ts
 * @description Flushes queued offline scores to the backend.
 * On success: removes from queue. On failure: increments retries, drops after 3.
 */
import { dequeueAll, remove, update } from '../lib/offlineQueue';

const MAX_RETRIES = 3;

/**
 * Flushes all queued scores to the backend.
 * Returns counts of submitted and failed entries.
 */
export const flushQueue = async (): Promise<{ submitted: number; failed: number }> => {
  const queue = await dequeueAll();

  if (queue.length === 0) {
    return { submitted: 0, failed: 0 };
  }

  let submitted = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    queue.map(async (entry) => {
      try {
        const token = localStorage.getItem('zenith-auth-token');
        if (!token) {
          throw new Error('No auth token available');
        }

        const response = await fetch(entry.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(entry.payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        await remove(entry.id);
        return { id: entry.id, status: 'success' as const };
      } catch (error: unknown) {
        return { id: entry.id, status: 'error' as const, error };
      }
    })
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const entry = queue[i];

    if (result.status === 'fulfilled' && result.value.status === 'success') {
      submitted += 1;
    } else {
      const newRetries = entry.retries + 1;
      if (newRetries >= MAX_RETRIES) {
        await remove(entry.id);
        failed += 1;
      } else {
        await update({ ...entry, retries: newRetries });
      }
    }
  }

  return { submitted, failed };
};
