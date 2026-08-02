/**
 * @file EndTurnButton.tsx
 * @description End-turn button with cyan glow when active, dimmed when not player's turn.
 */
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useCardStore } from '../store/cardStore';

export const EndTurnButton: React.FC = () => {
  const { endTurn, currentTurn, spectatorMode } = useCardStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isPlayerTurn = currentTurn === 'player';
  const disabled = !isPlayerTurn || spectatorMode;

  const handleEnter = () => {
    if (!disabled && buttonRef.current) {
      gsap.to(buttonRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
    }
  };
  const handleLeave = () => {
    if (!disabled && buttonRef.current) {
      gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }
  };
  const handleDown = () => {
    if (!disabled && buttonRef.current) {
      gsap.to(buttonRef.current, { scale: 0.95, duration: 0.1, ease: 'power2.out' });
    }
  };
  const handleUp = () => {
    if (!disabled && buttonRef.current) {
      gsap.to(buttonRef.current, { scale: 1.05, duration: 0.1, ease: 'power2.out' });
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={endTurn}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      disabled={disabled}
      className={`relative px-4 sm:px-6 py-2.5 rounded-lg font-mono font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 border-2 ${
        disabled
          ? 'bg-glass border-border-glass text-text-muted opacity-50 cursor-not-allowed'
          : 'bg-neon-cyan text-bg-primary border-neon-cyan shadow-[0_0_12px_#00f5ff,0_0_28px_rgba(0,245,255,0.4)] hover:bg-opacity-90'
      }`}
      style={!disabled ? { textShadow: '0 0 4px rgba(0,0,0,0.3)' } : undefined}
    >
      {isPlayerTurn ? '▶ End Turn' : '⏳ Enemy'}
    </button>
  );
};
