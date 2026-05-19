/**
 * @file useAchievements.ts
 * @description Hook that fetches achievements on mount and subscribes
 * to the private Echo channel for real-time unlock notifications.
 *
 * Requires useEcho (T1-2) to be completed for the WebSocket subscription.
 */
import { useEffect } from 'react';
import { useAchievementStore } from '../store/achievementStore';
import { useEcho } from './useEcho';
import { useAuthStore } from '../store/authStore';

/**
 * Hook for achievement management.
 * Fetches achievements on mount and listens for real-time unlocks.
 */
export const useAchievements = () => {
  const { fetchAchievements, unlockAchievement } = useAchievementStore();
  const { subscribe, unsubscribe } = useEcho();
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  useEffect(() => {
    if (!userId) return;

    const channelName = `user.${userId}`;
    const channel = subscribe(channelName);

    channel.listen('.achievement.unlocked', (payload: {
      achievement: { slug: string; name: string; description: string; icon: string };
      unlocked_at: string;
    }) => {
      unlockAchievement({
        slug: payload.achievement.slug,
        name: payload.achievement.name,
        description: payload.achievement.description,
        icon: payload.achievement.icon,
        unlocked_at: payload.unlocked_at,
      });
    });

    return () => {
      unsubscribe(channelName);
    };
  }, [userId, subscribe, unsubscribe, unlockAchievement]);

  return {};
};
