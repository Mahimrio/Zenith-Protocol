/**
 * @file leaderboardStore.ts
 * @description Zustand store for real-time leaderboard state.
 *
 * Manages the top-100 entries per game, the authenticated user's
 * personal rank/score, and provides an insertOrUpdateEntry action
 * for live WebSocket updates that keep the list sorted and trimmed.
 */
import { create } from 'zustand';
import api from '../lib/axios';

/** Shape of a single leaderboard row (matches API + broadcast payload). */
export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  score: number;
  completed_at: string | null;
  /** Transient flag for GSAP new-entry animation. */
  isNew?: boolean;
}

/** API response shape from GET /api/leaderboards. */
interface LeaderboardApiResponse {
  data: LeaderboardEntry[];
  meta: {
    game_id: string;
    your_rank: number | null;
    your_score: number | null;
    generated_at: string;
  };
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  myRank: number | null;
  myScore: number | null;
  activeGame: string;
  isLoading: boolean;
  lastUpdated: Date | null;

  /** Fetch leaderboard from REST endpoint for a specific game. */
  fetchLeaderboard: (gameId: string) => Promise<void>;

  /**
   * Insert a new entry (from WebSocket) at the correct rank position,
   * re-number all subsequent entries, and trim to top 100.
   */
  insertOrUpdateEntry: (entry: LeaderboardEntry) => void;

  /** Switch the active game tab. */
  setActiveGame: (gameId: string) => void;
}

/** Maximum entries kept in the local leaderboard. */
const MAX_ENTRIES = 100;

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  myRank: null,
  myScore: null,
  activeGame: 'dojo-3d',
  isLoading: false,
  lastUpdated: null,

  fetchLeaderboard: async (gameId: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<LeaderboardApiResponse>(
        `/leaderboards?game=${gameId}&limit=${MAX_ENTRIES}`,
      );
      set({
        entries: data.data,
        myRank: data.meta.your_rank,
        myScore: data.meta.your_score,
        activeGame: gameId,
        lastUpdated: new Date(),
      });
    } catch {
      // Silently fail — stale data is better than no data
    } finally {
      set({ isLoading: false });
    }
  },

  insertOrUpdateEntry: (entry: LeaderboardEntry) => {
    const { entries } = get();

    // Check if this user already has an entry
    const existingIndex = entries.findIndex(
      (e) => e.user.id === entry.user.id,
    );

    let updated: LeaderboardEntry[];

    if (existingIndex !== -1) {
      // User already on the board — only update if new score is higher
      if (entry.score <= entries[existingIndex].score) return;
      // Remove old entry before reinserting at new position
      updated = entries.filter((_, i) => i !== existingIndex);
    } else {
      updated = [...entries];
    }

    // Find correct insertion index (sorted DESC by score)
    const insertAt = updated.findIndex((e) => entry.score > e.score);
    const position = insertAt === -1 ? updated.length : insertAt;

    // Mark as new for GSAP animation
    const newEntry: LeaderboardEntry = { ...entry, isNew: true };
    updated.splice(position, 0, newEntry);

    // Re-number ranks and trim to MAX_ENTRIES
    const trimmed = updated.slice(0, MAX_ENTRIES).map((e, i) => ({
      ...e,
      rank: i + 1,
    }));

    set({ entries: trimmed, lastUpdated: new Date() });
  },

  setActiveGame: (gameId: string) => {
    set({ activeGame: gameId, entries: [], myRank: null, myScore: null });
  },
}));
