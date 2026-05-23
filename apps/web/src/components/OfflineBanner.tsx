/**
 * @file OfflineBanner.tsx
 * @description Animated banner that shows offline status and sync progress.
 * Offline: slides down with "You're offline. Scores will sync on reconnect." + pending count.
 * Back online: green "Syncing scores..." for 3s, then slides back up.
 */
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getCount } from '../lib/offlineQueue';

export const OfflineBanner: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const bannerRef = useRef<HTMLDivElement>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isOnline) {
      getCount().then(setPendingCount).catch(() => setPendingCount(0));
    }
  }, [isOnline]);

  useEffect(() => {
    if (!bannerRef.current) return;

    if (!isOnline) {
      gsap.to(bannerRef.current, {
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else if (wasOffline) {
      gsap.to(bannerRef.current, {
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
      const timer = setTimeout(() => {
        if (bannerRef.current) {
          gsap.to(bannerRef.current, {
            y: -48,
            duration: 0.4,
            ease: 'power2.in',
          });
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      gsap.set(bannerRef.current, { y: -48 });
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !wasOffline) return null;

  const isSyncing = isOnline && wasOffline;

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-3 backdrop-blur-md"
      style={{
        y: -48,
        background: isSyncing
          ? 'rgba(16, 185, 129, 0.15)'
          : 'rgba(245, 158, 11, 0.15)',
        borderBottom: isSyncing
          ? '1px solid rgba(16, 185, 129, 0.3)'
          : '1px solid rgba(245, 158, 11, 0.3)',
      }}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <div
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: isSyncing ? '#10b981' : '#f59e0b',
            boxShadow: isSyncing
              ? '0 0 8px #10b981'
              : '0 0 8px #f59e0b',
          }}
        />
        <span style={{ color: isSyncing ? '#10b981' : '#f59e0b' }}>
          {isSyncing
            ? 'Syncing scores...'
            : `You're offline. Scores will sync on reconnect.${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`}
        </span>
      </div>
    </div>
  );
};

export default OfflineBanner;
