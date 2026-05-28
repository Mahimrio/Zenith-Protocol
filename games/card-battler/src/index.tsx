/**
 * @file index.tsx
 * @description Main entry point for the Tactical Card Battler module.
 */
import React, { useEffect } from 'react';
import { useCardStore } from './store/cardStore';
import { useGameBridge } from '@sdk/useGameBridge';
import { GameBoard } from './components/GameBoard';
import { PlayerHand } from './components/PlayerHand';
import { TurnIndicator } from './components/TurnIndicator';
import { GameStatus } from '@sdk/types';

const CardBattlerGame: React.FC = () => {
  const { 
    startGame, gameStatus, currentTurn,
    spectatorMode, toggleSpectatorMode, playerHand, playerMana, playCard, endTurn
  } = useCardStore();
  const { emitGameOver, requestPause } = useGameBridge('card-battler');

  useEffect(() => {
    startGame();
    return () => {
      useCardStore.getState().cleanup();
    };
  }, [startGame]);

  useEffect(() => {
    if (gameStatus === GameStatus.GAME_OVER) {
      const state = useCardStore.getState();
      const finalScore = (state.turnsSurvived * 100)
        + (state.cardsPlayed * 25)
        + (state.isVictory ? 500 : 0);
      emitGameOver({
        score: finalScore,
        metadata: {
          turnsSurvived: state.turnsSurvived,
          cardsPlayed: state.cardsPlayed,
          finalEnemyHp: state.enemyHp,
        },
        completedAt: new Date().toISOString()
      }, spectatorMode);
    }
  }, [gameStatus, spectatorMode, emitGameOver]);

  // Autoplay loop when spectator mode is active
  useEffect(() => {
    if (gameStatus !== GameStatus.PLAYING || currentTurn !== 'player' || !spectatorMode) {
      return;
    }

    const playableCards = playerHand.filter(card => card.cost <= playerMana);

    const timer = setTimeout(() => {
      if (playableCards.length > 0) {
        const sorted = [...playableCards].sort((a, b) => b.cost - a.cost);
        const cardToPlay = sorted[0];
        playCard(cardToPlay.instanceId);
      } else {
        endTurn();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [gameStatus, currentTurn, spectatorMode, playerHand, playerMana, playCard, endTurn]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && gameStatus === GameStatus.PLAYING) {
        requestPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, requestPause]);

  if (gameStatus === GameStatus.IDLE) return null;

  return (
    <div className="w-full h-full relative bg-bg-primary overflow-hidden font-sans pt-16">
      {/* Spectator Mode Control */}
      <div className="absolute top-20 right-6 z-40">
        <button
          onClick={toggleSpectatorMode}
          className={`px-4 py-2 rounded-xl border backdrop-blur-md font-mono text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer select-none pointer-events-auto ${
            spectatorMode
              ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,245,255,0.4)]'
              : 'bg-glass border-border-glass text-text-muted hover:text-text-primary hover:border-text-primary'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${spectatorMode ? 'bg-neon-cyan animate-pulse shadow-[0_0_8px_#00f5ff]' : 'bg-text-muted'}`} />
          {spectatorMode ? 'Spectating AI' : 'Spectate Game'}
        </button>
      </div>

      <GameBoard />
      <PlayerHand />
      <TurnIndicator currentTurn={currentTurn} />
    </div>
  );
};

export default CardBattlerGame;
