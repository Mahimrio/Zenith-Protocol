/**
 * @file HUD.tsx
 * @description Glassmorphism overlay (health, score, wave).
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useDojoStore } from '../store/dojoStore';
import { useWaveManager } from '../hooks/useWaveManager';
import { GlassCard } from '@ui/GlassCard';
import { HealthBar } from '@ui/HealthBar';
import { ScoreDisplay } from '@ui/ScoreDisplay';

export const HUD: React.FC = () => {
  const { player, score, combo, enemies } = useDojoStore();
  const { waveState, countdown } = useWaveManager();
  
  const hudRef = useRef<HTMLDivElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hudRef.current) {
      gsap.fromTo(hudRef.current.children,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (combo > 1 && comboRef.current) {
      gsap.fromTo(comboRef.current,
        { scale: 1.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'bounce.out' }
      );
    }
  }, [combo]);

  return (
    <div ref={hudRef} className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
      <div className="flex justify-between items-start">
        <GlassCard className="p-4 w-64 pointer-events-auto">
          <HealthBar current={player.hp} max={player.maxHp} label="CURSED ENERGY" />
        </GlassCard>

        <div className="flex flex-col items-center">
          <GlassCard className="px-8 py-4 pointer-events-auto flex flex-col items-center border-neon-cyan shadow-[0_0_8px_#00f5ff40]">
            <span className="text-neon-cyan font-mono tracking-widest text-sm mb-1 uppercase">
              {waveState === 'WAVE_CLEAR' ? 'WAVE CLEAR' : `WAVE ${useDojoStore.getState().wave}`}
            </span>
            <ScoreDisplay score={score} animated />
          </GlassCard>
          {waveState === 'WAVE_CLEAR' && (
            <div className="mt-4 text-3xl font-bold text-neon-purple drop-shadow-[0_0_8px_#8b5cf6]">
              NEXT IN: {countdown}
            </div>
          )}
        </div>

        <GlassCard className="p-4 w-48 flex items-center justify-between pointer-events-auto border-neon-amber">
          <span className="text-text-muted font-mono text-sm uppercase">Targets</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-amber animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span className="text-neon-amber font-bold text-xl font-mono">{enemies.length}</span>
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-center pb-8">
        {combo > 1 && (
          <div ref={comboRef} className="text-4xl font-black italic text-neon-cyan uppercase" style={{ textShadow: '0 0 16px #00f5ff' }}>
            {combo}x COMBO!
          </div>
        )}
      </div>
    </div>
  );
};
