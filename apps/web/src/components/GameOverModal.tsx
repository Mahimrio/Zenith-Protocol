/**
 * @file GameOverModal.tsx
 * @description Modal displayed when game ends, showing final score and stats.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { GameResult } from '@sdk/types';
import { GlassCard } from '@ui/GlassCard';
import { NeonButton } from '@ui/NeonButton';
import { ScoreDisplay } from '@ui/ScoreDisplay';
import { useAuth } from '../hooks/useAuth';

export interface GameOverModalProps {
  result: GameResult;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ result, onPlayAgain, onMenu }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }
      );
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div ref={modalRef} className="w-full max-w-md">
        <GlassCard glowColor="neon-cyan" className="w-full p-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-text-primary mb-6 uppercase tracking-wider text-center" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Mission Complete
          </h2>
          
          <div className="w-full bg-black/40 rounded-xl p-6 mb-8 border border-border-glass shadow-inner">
            <ScoreDisplay score={result.score} label="Final Score" animated className="mb-6" />
            
            <div className="flex justify-between items-center text-sm font-mono border-t border-border-glass pt-4 mt-2">
              <span className="text-text-muted uppercase">Global Points</span>
              <span className="text-neon-amber">{user?.total_score || 0}</span>
            </div>
            {result.metadata && Object.keys(result.metadata).length > 0 && (
              <div className="flex justify-between items-center text-sm font-mono pt-3 mt-3 border-t border-border-glass/50">
                <span className="text-text-muted uppercase">Stats</span>
                <span className="text-text-primary">
                   {String(Object.values(result.metadata)[0])}
                </span>
              </div>
            )}
          </div>

          <div className="w-full flex gap-4">
            <NeonButton variant="ghost" className="flex-1" onClick={onMenu}>
              Main Menu
            </NeonButton>
            <NeonButton variant="primary" className="flex-1" onClick={onPlayAgain}>
              Play Again
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
