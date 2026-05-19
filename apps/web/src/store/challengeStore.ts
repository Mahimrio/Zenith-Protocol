/**
 * @file challengeStore.ts
 * @description Zustand store for Daily Challenges.
 *
 * Manages:
 *  - Today's 3 challenges with completion status
 *  - Reset countdown timestamp
 *  - Total points earned today
 */
import { create } from 'zustand';
import api from '../lib/axios';

/** Shape of a daily challenge from the API. */
export interface DailyChallenge {
  id: number;
  game_id: string;
  challenge_type: string;
  title: string;
  description: string;
  target_value: number;
  reward_points: number;
  completed: boolean;
  progress_value: number;
}

/** Challenge state interface. */
interface ChallengeState {
  challenges: DailyChallenge[];
  resetsAt: string;
  totalEarnedToday: number;
  isLoading: boolean;

  fetchChallenges: () => Promise<void>;
  markCompleted: (id: number) => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  resetsAt: '',
  totalEarnedToday: 0,
  isLoading: false,

  fetchChallenges: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<{
        challenges: DailyChallenge[];
        resets_at: string;
        total_earned_today: number;
      }>('/daily-challenges');

      set({
        challenges: data.challenges,
        resetsAt: data.resets_at,
        totalEarnedToday: data.total_earned_today,
      });
    } catch {
      // Silently fail — challenges are optional
    } finally {
      set({ isLoading: false });
    }
  },

  markCompleted: (id: number) => {
    const { challenges, totalEarnedToday } = get();
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge || challenge.completed) return;

    const updated = challenges.map((c) =>
      c.id === id ? { ...c, completed: true, progress_value: c.target_value } : c
    );

    set({
      challenges: updated,
      totalEarnedToday: totalEarnedToday + challenge.reward_points,
    });
  },
}));
