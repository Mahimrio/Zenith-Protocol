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
  const { startGame, gameStatus, currentTurn, score, cardsPlayed, turnsSurvived } = useCardStore();
  const { emitGameOver, requestPause } = useGameBridge('card-battler');

  useEffect(() => {
    startGame();
    return () => {
      useCardStore.getState().cleanup();
    };
  }, [startGame]);

  useEffect(() => {
    if (gameStatus === GameStatus.GAME_OVER) {
      emitGameOver({
        score: score + turnsSurvived * 50,
        metadata: {
          turnsSurvived,
          cardsPlayed
        },
        completedAt: new Date().toISOString()
      });
    }
  }, [gameStatus, score, turnsSurvived, cardsPlayed, emitGameOver]);

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
      <GameBoard />
      <PlayerHand />
      <TurnIndicator currentTurn={currentTurn} />
    </div>
  );
};

export default CardBattlerGame;
