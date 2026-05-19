/**
 * @file achievementStore.ts
 * @description Zustand store for the Achievements System.
 *
 * Manages:
 *  - Full achievement list (fetched from REST)
 *  - Set of unlocked achievement slugs
 *  - Pending toast queue for real-time unlock notifications
 */
import { create } from 'zustand';
import api from '../lib/axios';

/** Shape of a single achievement from the API. */
export interface Achievement {
  slug: string;
  name: string;
  description: string;
  icon: string;
  game_id: string | null;
  unlocked: boolean;
  progress: number;
}

/** Shape of a grouped achievement response. */
export interface AchievementGroup {
  game_id: string;
  achievements: Achievement[];
  total: number;
  unlocked_count: number;
}

/** Toast item pushed to the pending queue on unlock. */
export interface AchievementToastItem {
  slug: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

/** Achievement state interface. */
interface AchievementState {
  /** All achievements grouped by game (from REST). */
  achievements: AchievementGroup[];
  /** Flat set of unlocked slugs for quick lookup. */
  unlocked: Set<string>;
  /** Queue of toasts waiting to be displayed. */
  pendingToast: AchievementToastItem | null;
  isLoading: boolean;

  /** Fetch achievements from REST endpoint. */
  fetchAchievements: () => Promise<void>;

  /**
   * Mark an achievement as unlocked and push it to the toast queue.
   * Called by the Echo subscription handler in useAchievements.
   */
  unlockAchievement: (data: AchievementToastItem) => void;

  /** Remove the current toast from the queue (after animation completes). */
  clearToast: () => void;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  unlocked: new Set(),
  pendingToast: null,
  isLoading: false,

  fetchAchievements: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<{ data: AchievementGroup[] }>('/achievements');
      const unlockedSlugs = new Set<string>();
      data.data.forEach((group) => {
        group.achievements.forEach((a) => {
          if (a.unlocked) {
            unlockedSlugs.add(a.slug);
          }
        });
      });
      set({ achievements: data.data, unlocked: unlockedSlugs });
    } catch {
      // Silently fail — stale data is better than no data
    } finally {
      set({ isLoading: false });
    }
  },

  unlockAchievement: (data: AchievementToastItem) => {
    const { unlocked } = get();
    if (unlocked.has(data.slug)) return;

    const newUnlocked = new Set(unlocked);
    newUnlocked.add(data.slug);

    set({
      unlocked: newUnlocked,
      pendingToast: data,
    });
  },

  clearToast: () => {
    set({ pendingToast: null });
  },
}));
