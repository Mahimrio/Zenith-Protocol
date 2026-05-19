/**
 * @file ChallengeCard.tsx
 * @description Card displaying a single daily challenge with progress bar.
 *
 * Features:
 *  - GlassCard with colored left border by game
 *  - Game pill badge + title + progress bar + reward badge
 *  - GSAP "COMPLETED" stamp overlay on completion
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { GlassCard } from '@ui/GlassCard';
import { HealthBar } from '@ui/HealthBar';
import type { DailyChallenge } from '../store/challengeStore';

const GAME_COLORS: Record<string, string> = {
  'dojo-3d': '#ff6b6b',
  'card-battler': '#14b8a6',
  'cyber-runner': '#3b82f6',
};

const GAME_LABELS: Record<string, string> = {
  'dojo-3d': 'DOJO',
  'card-battler': 'CARDS',
  'cyber-runner': 'RUNNER',
};

interface ChallengeCardProps {
  challenge: DailyChallenge;
}

/**
 * Single daily challenge card with progress and completion state.
 */
export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const stampRef = useRef<HTMLDivElement>(null);
  const borderColor = GAME_COLORS[challenge.game_id] ?? '#00f5ff';
  const gameLabel = GAME_LABELS[challenge.game_id] ?? challenge.game_id;
  const progress = Math.min(challenge.progress_value, challenge.target_value);

  useEffect(() => {
    if (challenge.completed && stampRef.current) {
      gsap.fromTo(
        stampRef.current,
        { scale: 2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [challenge.completed]);

  return (
    <GlassCard className="relative overflow-hidden pl-3" glowColor={challenge.completed ? 'neon-green' : undefined}>
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
        style={{ backgroundColor: borderColor }}
      />

      <div className="p-3 flex flex-col gap-2">
        {/* Header: game pill + title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: borderColor }}
            >
              {gameLabel}
            </span>
            <span className="text-sm font-bold text-text-primary">{challenge.title}</span>
          </div>
          <span
            className="text-xs font-bold text-neon-amber"
            style={{ textShadow: '0 0 6px #f59e0b80' }}
          >
            +{challenge.reward_points}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-text-muted">{challenge.description}</p>

        {/* Progress bar */}
        <HealthBar
          current={progress}
          max={challenge.target_value}
          color={borderColor}
          label="Progress"
        />
      </div>

      {/* Completed stamp overlay */}
      {challenge.completed && (
        <div
          ref={stampRef}
          className="absolute inset-0 flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-green/20 border border-neon-green/40">
            <svg className="w-5 h-5 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-bold text-neon-green tracking-widest">COMPLETED</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
