/**
 * @file DeckPile.tsx
 * @description Renders a stacked card-back icon with deck count overlay.
 */
import React from 'react';

export interface DeckPileProps {
  count: number;
  side: 'player' | 'enemy';
  size?: 'sm' | 'md';
}

export const DeckPile: React.FC<DeckPileProps> = ({ count, side, size = 'md' }) => {
  const isPlayer = side === 'player';
  const sizeClass = size === 'sm' ? 'w-12 h-16' : 'w-14 h-20';
  const ringColor = isPlayer ? 'border-neon-cyan' : 'border-neon-amber';
  const textColor = isPlayer ? 'text-neon-cyan' : 'text-neon-amber';
  const glow = isPlayer ? 'shadow-[0_0_12px_rgba(0,245,255,0.45)]' : 'shadow-[0_0_12px_rgba(245,158,11,0.45)]';

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className={`relative ${sizeClass}`}>
        {/* Stacked layers for depth */}
        <div className={`absolute top-1 left-1 w-full h-full rounded-lg border ${ringColor} opacity-30 ${glow}`} />
        <div className={`absolute top-0.5 left-0.5 w-full h-full rounded-lg border ${ringColor} opacity-50 ${glow}`} />
        <div
          className={`relative w-full h-full rounded-lg border-2 ${ringColor} bg-glass backdrop-blur-md flex items-center justify-center ${glow}`}
        >
          <div
            className="w-8 h-12 rounded border border-white/20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)',
            }}
          />
        </div>
        {count > 0 && (
          <div
            className={`absolute -bottom-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-bg-primary border ${ringColor} ${textColor} font-mono font-bold text-xs flex items-center justify-center ${glow}`}
          >
            {count}
          </div>
        )}
      </div>
      <span className={`text-[9px] font-mono uppercase tracking-widest ${textColor}`}>
        Deck
      </span>
    </div>
  );
};
