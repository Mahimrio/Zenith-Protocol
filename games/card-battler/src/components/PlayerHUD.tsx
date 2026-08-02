/**
 * @file PlayerHUD.tsx
 * @description Bottom HUD strip — deck pile, player HP, mana crystals, end turn button.
 */
import React from 'react';
import { useCardStore } from '../store/cardStore';
import { HPGauge } from './HPGauge';
import { ManaBar } from './ManaBar';
import { DeckPile } from './DeckPile';
import { EndTurnButton } from './EndTurnButton';

const MAX_PLAYER_HP = 30;

export const PlayerHUD: React.FC = () => {
  const { playerHp, playerDeck, spectatorMode } = useCardStore();

  return (
    <div className="w-full flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-8 py-3 border-t border-border-glass bg-bg-primary/60 backdrop-blur-md z-20 relative">
      {/* Left: Deck pile */}
      <DeckPile count={playerDeck.length} side="player" />

      {/* Left-center: Player HP */}
      <div className="flex-1 flex justify-center sm:justify-start min-w-0">
        <HPGauge
          current={playerHp}
          max={MAX_PLAYER_HP}
          color="#00f5ff"
          label="Player Hull"
          align="left"
        />
      </div>

      {/* Right-center: Mana */}
      <div className="flex-shrink-0">
        <ManaBar />
      </div>

      {/* Right: End Turn button */}
      <div className="flex-shrink-0">
        <EndTurnButton />
      </div>

      {/* Spectator indicator overlay (if active) */}
      {spectatorMode && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-[9px] font-mono uppercase tracking-widest shadow-[0_0_8px_rgba(0,245,255,0.5)]">
          Spectating AI
        </div>
      )}
    </div>
  );
};
