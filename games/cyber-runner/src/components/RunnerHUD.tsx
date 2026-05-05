/**
 * @file RunnerHUD.tsx
 * @description In-game UI overlay.
 */
import React from 'react';
import { useRunnerStore } from '../store/runnerStore';
import { GlassCard } from '@ui/GlassCard';
import { ScoreDisplay } from '@ui/ScoreDisplay';

export const RunnerHUD: React.FC<{ speedLevel: number }> = ({ speedLevel }) => {
  const { distance } = useRunnerStore();

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex justify-between items-start z-10">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black italic text-text-primary tracking-widest uppercase">
          CYBER<span className="text-neon-cyan drop-shadow-[0_0_8px_#00f5ff]">RUN</span>
        </h1>
      </div>

      <GlassCard className="p-4 px-6 flex flex-col items-center border-neon-cyan shadow-[0_0_8px_#00f5ff40] pointer-events-auto">
        <span className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Distance (m)</span>
        <ScoreDisplay score={Math.floor(distance / 100)} className="text-3xl" />
        <div className="mt-2 text-xs font-mono text-neon-purple font-bold">
          SPEED LVL: {speedLevel}
        </div>
      </GlassCard>
    </div>
  );
};
