/**
 * @file ManaBar.tsx
 * @description Renders mana as rotating diamond gems. Pulses on gain, dims on spend.
 * Self-subscribes to store (no props needed).
 */
import React, { useEffect, useRef, useState } from 'react';
import { useCardStore } from '../store/cardStore';

export const ManaBar: React.FC = () => {
  const { playerMana, playerMaxMana } = useCardStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const gemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevMana = useRef(playerMana);
  const prevMax = useRef(playerMaxMana);
  const [pulseIndex, setPulseIndex] = useState<number | null>(null);

  // Pulse on mana gain (or max-mana increase)
  useEffect(() => {
    if (playerMaxMana > prevMax.current) {
      const newGemIndex = playerMaxMana - 1;
      setPulseIndex(newGemIndex);
      const t = setTimeout(() => setPulseIndex(null), 700);
      prevMax.current = playerMaxMana;
      prevMana.current = playerMana;
      return () => clearTimeout(t);
    }
    if (playerMana > prevMana.current) {
      setPulseIndex(playerMana - 1);
      const t = setTimeout(() => setPulseIndex(null), 700);
      prevMana.current = playerMana;
      return () => clearTimeout(t);
    }
    prevMana.current = playerMana;
  }, [playerMana, playerMaxMana]);

  // Dim anim on spend — handled via class swap, no extra effect needed

  const crystals = Array.from({ length: Math.min(10, playerMaxMana) });

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <span className="text-[9px] font-mono text-neon-purple uppercase tracking-widest font-bold">
        Mana {playerMana}/{playerMaxMana}
      </span>
      <div
        ref={containerRef}
        className="flex items-center justify-center gap-1.5"
      >
        {crystals.map((_, i) => {
          const filled = i < playerMana;
          const isPulseTarget = pulseIndex === i;
          return (
            <div
              key={i}
              ref={(el) => { gemRefs.current[i] = el; }}
              className="relative"
              style={{ width: 20, height: 20 }}
            >
              <div
                className={`absolute inset-0 rotate-45 rounded-sm border-2 transition-all duration-300 ${
                  filled
                    ? 'bg-neon-purple border-neon-purple'
                    : 'bg-transparent border-text-muted/40'
                }`}
                style={
                  filled
                    ? {
                        boxShadow:
                          '0 0 6px #8b5cf6, 0 0 12px rgba(139,92,246,0.6), inset 0 0 4px rgba(255,255,255,0.4)',
                      }
                    : { opacity: 0.5 }
                }
              />
              {isPulseTarget && (
                <div
                  className="absolute inset-0 rotate-45 rounded-sm border-2 border-neon-cyan"
                  style={{
                    animation: 'mana-pulse 0.7s ease-out forwards',
                    boxShadow: '0 0 16px #00f5ff, 0 0 28px rgba(0,245,255,0.6)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes mana-pulse {
          0% { transform: rotate(45deg) scale(0.6); opacity: 1; }
          50% { transform: rotate(45deg) scale(1.5); opacity: 0.6; }
          100% { transform: rotate(45deg) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
