/**
 * @file useNetworkStatus.ts
 * @description Hook that tracks online/offline status.
 * Returns: { isOnline, wasOffline }
 * On transition from offline to online: triggers flushQueue().
 */
import { useState, useEffect, useCallback } from 'react';
import { flushQueue } from '../worker/syncWorker';

let wasOfflineRef = false;

/**
 * Tracks network connectivity and auto-syncs queued scores on reconnect.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(async () => {
    setIsOnline(true);
    if (wasOfflineRef) {
      setWasOffline(true);
      wasOfflineRef = false;
      try {
        await flushQueue();
      } catch (error: unknown) {
        console.error('Failed to flush offline queue on reconnect:', error);
      }
      const timer = setTimeout(() => setWasOffline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    wasOfflineRef = true;
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline };
};
