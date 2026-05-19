/**
 * @file useDailyChallenges.ts
 * @description Hook for daily challenges with countdown timer.
 *
 * Features:
 *  - Fetches challenges on mount (requires auth)
 *  - Countdown "HH:MM:SS" via DOM ref mutation (no re-renders)
 *  - Returns challenges, resetsAt, countdown, totalEarnedToday
 */
import { useEffect, useRef } from 'react';
import { useChallengeStore } from '../store/challengeStore';
import { useAuth } from './useAuth';

/**
 * Daily challenges hook.
 *
 * @returns Object with challenges, resetsAt, countdown ref callback, totalEarnedToday
 */
export function useDailyChallenges() {
  const { challenges, resetsAt, totalEarnedToday, fetchChallenges } = useChallengeStore();
  const { isAuthenticated } = useAuth();
  const countdownRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChallenges();
    }
  }, [isAuthenticated, fetchChallenges]);

  useEffect(() => {
    if (!resetsAt) return;

    const updateCountdown = () => {
      if (!countdownRef.current) return;

      const resetTime = new Date(resetsAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, resetTime - now);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      countdownRef.current.textContent =
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resetsAt]);

  return {
    challenges,
    resetsAt,
    totalEarnedToday,
    countdownRef,
  };
}
