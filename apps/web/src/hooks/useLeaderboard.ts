/**
 * @file useLeaderboard.ts
 * @description Composite hook that wires the leaderboard REST fetch
 * to real-time Echo channel subscriptions.
 *
 * On mount:  fetches current leaderboard + subscribes to Echo channel.
 * On score.submitted: calls insertOrUpdateEntry for live updates.
 * On activeGame change: unsubscribes old channel, subscribes new, re-fetches.
 * On unmount: cleans up the Echo subscription.
 */
import { useEffect, useRef } from 'react';
import { useLeaderboardStore, type LeaderboardEntry } from '../store/leaderboardStore';
import { useEcho } from './useEcho';

/** Payload shape received from the 'score.submitted' broadcast event. */
interface ScoreSubmittedPayload {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  score: number;
  game_id: string;
  submitted_at: string;
}

/**
 * Hook that manages leaderboard data fetching and real-time WebSocket updates.
 *
 * @returns Leaderboard state: entries, personal rank/score, loading, lastUpdated.
 *
 * @example
 * ```tsx
 * const { entries, myRank, isLoading } = useLeaderboard();
 * ```
 */
export const useLeaderboard = () => {
  const {
    entries,
    myRank,
    myScore,
    activeGame,
    isLoading,
    lastUpdated,
    fetchLeaderboard,
    insertOrUpdateEntry,
  } = useLeaderboardStore();

  const { subscribe, unsubscribe } = useEcho();
  const currentChannel = useRef<string | null>(null);

  useEffect(() => {
    const channelName = `leaderboard.${activeGame}`;

    // Fetch fresh data from REST
    fetchLeaderboard(activeGame);

    // Unsubscribe from previous channel if switching games
    if (currentChannel.current && currentChannel.current !== channelName) {
      unsubscribe(currentChannel.current);
    }

    // Subscribe to new channel
    const channel = subscribe(channelName);
    currentChannel.current = channelName;

    channel.listen('.score.submitted', (payload: ScoreSubmittedPayload) => {
      const entry: LeaderboardEntry = {
        rank: payload.rank,
        user: payload.user,
        score: payload.score,
        completed_at: payload.submitted_at,
        isNew: true,
      };
      insertOrUpdateEntry(entry);
    });

    // Cleanup on unmount or game change
    return () => {
      if (currentChannel.current) {
        unsubscribe(currentChannel.current);
        currentChannel.current = null;
      }
    };
  }, [activeGame, fetchLeaderboard, insertOrUpdateEntry, subscribe, unsubscribe]);

  return { entries, myRank, myScore, activeGame, isLoading, lastUpdated };
};
