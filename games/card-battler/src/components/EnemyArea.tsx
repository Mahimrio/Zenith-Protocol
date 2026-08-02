/**
 * @file EnemyArea.tsx
 * @description Top zone — enemy portrait, HP bar, intent preview, and face-down hand.
 */
import React from 'react';
import { useCardStore } from '../store/cardStore';
import { HPGauge } from './HPGauge';
import { DeckPile } from './DeckPile';
import type { CardInstance } from '../types';

const MAX_ENEMY_HP = 30;

export const EnemyArea: React.FC = () => {
  const { enemyHp, enemyMaxMana, enemyHand, enemyDeck, spectatorMode } = useCardStore();

  // Intent preview: show the highest-cost affordable card the enemy will play
  const intent: CardInstance | null = (() => {
    const affordable = enemyHand.filter((c) => c.cost <= enemyMaxMana);
    if (affordable.length === 0) return null;
    return [...affordable].sort((a, b) => b.cost - a.cost)[0];
  })();

  return (
    <div className="w-full flex items-center justify-between gap-4 px-4 sm:px-8 py-3 border-b border-border-glass bg-bg-primary/40 backdrop-blur-sm z-20 relative">
      {/* Left: Enemy portrait + HP + intent */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Portrait */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-glass border-2 border-neon-amber backdrop-blur-md flex items-center justify-center shadow-[0_0_18px_rgba(245,158,11,0.5)]"
          >
            <span className="text-3xl sm:text-4xl" aria-hidden>👹</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-amber animate-pulse shadow-[0_0_8px_#f59e0b]" />
        </div>

        {/* HP + intent */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon-amber font-bold">
            Enemy AI
          </div>
          <HPGauge
            current={enemyHp}
            max={MAX_ENEMY_HP}
            color="#ef4444"
            label="Hull Integrity"
            align="left"
          />
          {/* Intent preview */}
          {intent && (
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-text-muted">
              <span className="text-neon-amber">▶ Intent:</span>
              {spectatorMode ? (
                <span className="text-text-primary truncate">{intent.name}</span>
              ) : (
                <span className="text-text-primary truncate">Unknown</span>
              )}
              <span className="text-neon-purple">[{intent.cost} ✦]</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Face-down enemy hand (compact) */}
      <div className="hidden md:flex items-end gap-1 px-4 h-16">
        {enemyHand.slice(0, 7).map((card) => (
          <div
            key={card.instanceId}
            className="w-8 h-12 rounded border border-neon-purple/40 bg-neon-purple/10 backdrop-blur-sm shadow-[0_0_6px_rgba(139,92,246,0.3)]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(139,92,246,0.15) 3px, rgba(139,92,246,0.15) 6px)',
            }}
          />
        ))}
      </div>

      {/* Right: Enemy deck pile */}
      <DeckPile count={enemyDeck.length} side="enemy" />
    </div>
  );
};
