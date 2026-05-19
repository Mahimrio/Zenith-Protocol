/**
 * @file AchievementToast.tsx
 * @description Fixed-position toast notification for achievement unlocks.
 *
 * Reads the pendingToast queue from achievementStore and displays
 * a glassmorphic card with neon-amber glow, trophy icon, and
 * GSAP slide-in/out animations.
 *
 * Mount once in App.tsx (outside all routes).
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAchievementStore } from '../store/achievementStore';
import { GlassCard } from '@ui/GlassCard';

/**
 * Achievement toast displayed at top-right when a new achievement is unlocked.
 * Auto-dismisses after 3 seconds with a GSAP slide-out animation.
 */
export const AchievementToast: React.FC = () => {
  const { pendingToast, clearToast } = useAchievementStore();
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pendingToast || !toastRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      toastRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
    )
    .to(
      toastRef.current,
      { y: -100, opacity: 0, duration: 0.4, delay: 3, ease: 'power2.in' },
    )
    .call(() => {
      clearToast();
    });

    return () => {
      tl.kill();
    };
  }, [pendingToast, clearToast]);

  if (!pendingToast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <div ref={toastRef} style={{ opacity: 0 }}>
        <GlassCard glowColor="neon-amber" className="p-4 flex items-start gap-3">
          {/* Trophy icon */}
          <div className="text-3xl flex-shrink-0 mt-0.5">
            {pendingToast.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-neon-amber uppercase tracking-wider mb-0.5">
              Achievement Unlocked
            </div>
            <div className="text-sm font-semibold text-text-primary truncate">
              {pendingToast.name}
            </div>
            <div className="text-xs text-text-muted mt-0.5 leading-snug">
              {pendingToast.description}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
