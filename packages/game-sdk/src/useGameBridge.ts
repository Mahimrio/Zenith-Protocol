/**
 * @file useGameBridge.ts
 * @description React hook consumed by game modules to interact with the Host App.
 */
import { useEffect, useState, useCallback } from 'react';
import { gameBus } from './eventBus';
import { GameResult, GameStatus } from './types';

export const useGameBridge = (gameId: string) => {
  const [currentStatus, setCurrentStatus] = useState<GameStatus>(GameStatus.IDLE);

  useEffect(() => {
    setCurrentStatus(GameStatus.PLAYING);
    gameBus.emit('GAME_STARTED', { gameId });
    return () => {
      // Cleanups
    };
  }, [gameId]);

  const emitGameOver = useCallback((result: Omit<GameResult, 'gameId'>) => {
    const fullResult: GameResult = { ...result, gameId };
    setCurrentStatus(GameStatus.GAME_OVER);
    gameBus.emit('GAME_OVER', fullResult);
    
    // Post to the backend API endpoint
    fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(fullResult)
    }).catch(err => console.error('Failed to post score:', err));
  }, [gameId]);

  const emitScore = useCallback((result: Omit<GameResult, 'gameId'>) => {
    const fullResult: GameResult = { ...result, gameId };
    gameBus.emit('SCORE_SUBMIT', fullResult);
  }, [gameId]);

  const requestPause = useCallback(() => {
    setCurrentStatus(GameStatus.PAUSED);
    gameBus.emit('PAUSE_REQUESTED');
  }, []);

  return { emitGameOver, emitScore, requestPause, currentStatus };
};
