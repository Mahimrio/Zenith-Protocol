/**
 * @file Leaderboard.tsx
 * @description Real-time leaderboard component with game tab switching,
 * GSAP animations for new entries, and glassmorphic styling.
 *
 * Features:
 *  - Game tab switcher with GSAP sliding indicator
 *  - Top-3 neon rank badges (gold / silver / coral)
 *  - Current user row highlighted with neon-purple border
 *  - Live green pulse dot indicating WebSocket connection
 *  - New entry slide-in animation via GSAP
 *  - Loading skeleton with pulsing opacity
 *  - "Your Rank" footer when user is outside top 100
 */
import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { GlassCard } from '@ui/GlassCard';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { useAuthStore } from '../store/authStore';

/** Game definitions for tab switcher. */
const GAMES = [
  { id: 'dojo-3d', label: 'Dojo 3D' },
  { id: 'card-battler', label: 'Card Battler' },
  { id: 'cyber-runner', label: 'Cyber Runner' },
] as const;

/** Rank badge color map for top 3 positions. */
const RANK_COLORS: Record<number, { bg: string; text: string; shadow: string }> = {
  1: { bg: 'bg-neon-amber/20', text: 'text-neon-amber', shadow: '0 0 8px #f59e0b60' },
  2: { bg: 'bg-gray-300/20', text: 'text-gray-300', shadow: '0 0 8px #d1d5db60' },
  3: { bg: 'bg-rose-400/20', text: 'text-rose-400', shadow: '0 0 8px #fb718560' },
};

/**
 * Generates initials from a user name for the avatar circle.
 */
function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/**
 * Formats a score number with locale-aware thousands separators.
 */
function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Formats an ISO date string into a short display format.
 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ────────────────────────────── SKELETON ────────────────────────────── */

/** Loading skeleton row with pulsing opacity. */
const SkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <tr
    className="animate-pulse"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <td className="py-3 px-4">
      <div className="h-5 w-6 rounded bg-white/5" />
    </td>
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/5" />
        <div className="h-4 w-24 rounded bg-white/5" />
      </div>
    </td>
    <td className="py-3 px-4 text-right">
      <div className="h-4 w-16 rounded bg-white/5 ml-auto" />
    </td>
    <td className="py-3 px-4 text-right hidden sm:table-cell">
      <div className="h-4 w-14 rounded bg-white/5 ml-auto" />
    </td>
  </tr>
);

/* ────────────────────────────── RANK BADGE ──────────────────────────── */

/** Styled rank display — badges for top 3, plain text otherwise. */
const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const style = RANK_COLORS[rank];
  if (style) {
    return (
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${style.bg} ${style.text}`}
        style={{ boxShadow: style.shadow }}
      >
        {rank}
      </span>
    );
  }
  return <span className="text-text-muted text-sm font-mono">{rank}</span>;
};

/* ────────────────────────────── MAIN COMPONENT ─────────────────────── */

/**
 * Real-time leaderboard with game tab switching and GSAP animations.
 *
 * Subscribes to WebSocket events via `useLeaderboard` and animates
 * new entries sliding in from the right.
 */
export const Leaderboard: React.FC = () => {
  const { entries, myRank, myScore, activeGame, isLoading, lastUpdated } = useLeaderboard();
  const { setActiveGame } = useLeaderboardStore();
  const currentUser = useAuthStore((s) => s.user);

  const tabIndicatorRef = useRef<HTMLDivElement>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const prevEntriesRef = useRef<string[]>([]);

  /* ── Tab indicator slide animation ──────────────────────────────── */
  const moveIndicator = useCallback((gameId: string) => {
    if (!tabContainerRef.current || !tabIndicatorRef.current) return;
    const activeTab = tabContainerRef.current.querySelector(
      `[data-game="${gameId}"]`,
    ) as HTMLElement | null;
    if (!activeTab) return;

    gsap.to(tabIndicatorRef.current, {
      x: activeTab.offsetLeft,
      width: activeTab.offsetWidth,
      duration: 0.35,
      ease: 'power2.out',
    });
  }, []);

  useEffect(() => {
    moveIndicator(activeGame);
  }, [activeGame, moveIndicator]);

  /* ── Animate new entries ────────────────────────────────────────── */
  useEffect(() => {
    if (!tableBodyRef.current || isLoading) return;

    const currentIds = entries.map((e) => `${e.user.id}-${e.score}`);
    const prevIds = prevEntriesRef.current;

    entries.forEach((entry, index) => {
      const entryKey = `${entry.user.id}-${entry.score}`;
      if (entry.isNew && !prevIds.includes(entryKey)) {
        const row = tableBodyRef.current?.children[index] as HTMLElement | undefined;
        if (row) {
          gsap.from(row, {
            x: 60,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
          });

          // Animate rows below shifting down
          const rowsBelow = Array.from(tableBodyRef.current?.children ?? []).slice(index + 1);
          if (rowsBelow.length > 0) {
            gsap.to(rowsBelow, {
              y: '+=48',
              duration: 0.3,
              stagger: 0.02,
              ease: 'power2.out',
              onComplete: () => {
                gsap.set(rowsBelow, { y: 0 });
              },
            });
          }
        }
      }
    });

    prevEntriesRef.current = currentIds;
  }, [entries, isLoading]);

  /* ── Tab click handler ──────────────────────────────────────────── */
  const handleTabClick = useCallback(
    (gameId: string) => {
      if (gameId === activeGame) return;
      setActiveGame(gameId);
    },
    [activeGame, setActiveGame],
  );

  const showPersonalRank = myRank !== null && myRank > 100;

  return (
    <GlassCard className="w-full overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text-primary tracking-wider uppercase">
            Leaderboard
          </h2>
          {/* Live indicator pulse */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-green" />
          </span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-text-muted font-mono">
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* ── Game Tab Switcher ──────────────────────────────────────── */}
      <div className="px-6 pb-4">
        <div
          ref={tabContainerRef}
          className="relative flex gap-1 bg-white/[0.03] rounded-lg p-1"
        >
          {/* Sliding indicator */}
          <div
            ref={tabIndicatorRef}
            className="absolute top-1 bottom-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/30"
            style={{ width: 0, left: 0, transition: 'none' }}
          />

          {GAMES.map((game) => (
            <button
              key={game.id}
              data-game={game.id}
              onClick={() => handleTabClick(game.id)}
              className={`
                relative z-10 flex-1 py-2 px-3 rounded-md text-xs font-semibold
                tracking-wide uppercase transition-colors duration-200 cursor-pointer
                ${activeGame === game.id
                  ? 'text-neon-cyan'
                  : 'text-text-muted hover:text-text-primary'
                }
              `}
            >
              {game.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-glass text-text-muted text-xs uppercase tracking-wider">
              <th className="py-2 px-4 text-left font-medium w-12">#</th>
              <th className="py-2 px-4 text-left font-medium">Player</th>
              <th className="py-2 px-4 text-right font-medium">Score</th>
              <th className="py-2 px-4 text-right font-medium hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody ref={tableBodyRef}>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <SkeletonRow key={i} index={i} />
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-text-muted text-sm italic"
                >
                  No scores recorded yet. Be the first!
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isCurrentUser = currentUser?.id === entry.user.id;
                return (
                  <tr
                    key={`${entry.user.id}-${entry.rank}`}
                    className={`
                      border-b border-border-glass/50 transition-colors duration-200
                      hover:bg-white/[0.03]
                      ${isCurrentUser
                        ? 'bg-neon-purple/[0.06] border-l-2 border-l-neon-purple'
                        : ''
                      }
                    `}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4">
                      <RankBadge rank={entry.rank} />
                    </td>

                    {/* Player */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar initial circle */}
                        <div
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center
                            text-xs font-bold shrink-0
                            ${isCurrentUser
                              ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40'
                              : 'bg-glass border border-border-glass text-text-primary'
                            }
                          `}
                        >
                          {getInitial(entry.user.name)}
                        </div>
                        <span
                          className={`
                            font-medium truncate max-w-[140px]
                            ${isCurrentUser ? 'text-neon-purple' : 'text-text-primary'}
                          `}
                        >
                          {entry.user.name}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-[10px] text-neon-purple/70 uppercase">
                              you
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-semibold text-neon-cyan">
                        {formatScore(entry.score)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-right text-text-muted text-xs hidden sm:table-cell">
                      {formatDate(entry.completed_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Your Rank Footer (if outside top 100) ─────────────────── */}
      {showPersonalRank && (
        <div className="px-6 py-3 border-t border-border-glass bg-neon-purple/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-xs font-bold text-neon-purple">
              {currentUser ? getInitial(currentUser.name) : '?'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary">
                Your Rank
              </span>
              <span className="text-xs text-text-muted">
                Keep climbing!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-text-muted uppercase">Rank</div>
              <div className="font-mono font-bold text-neon-purple">
                #{myRank?.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-muted uppercase">Score</div>
              <div className="font-mono font-bold text-neon-cyan">
                {myScore?.toLocaleString() ?? '—'}
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
