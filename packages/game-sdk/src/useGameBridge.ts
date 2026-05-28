/**
 * @file useGameBridge.ts
 * @description React hook consumed by game modules to interact with the Host App.
 */
import { useEffect, useState, useCallback } from 'react';
import { gameBus } from './eventBus';
import type { GameResult, GameResultPayload } from './types';
import { GameStatus } from './types';

export const useGameBridge = (gameId: string) => {
  const [currentStatus, setCurrentStatus] = useState<GameStatus>(GameStatus.IDLE);

  useEffect(() => {
    setCurrentStatus(GameStatus.PLAYING);
    gameBus.emit('GAME_STARTED', { gameId });
    return () => {
      // Cleanups
    };
  }, [gameId]);

  const emitGameOver = useCallback((result: GameResultPayload) => {
    const fullResult = { ...result, gameId } as GameResult;
    setCurrentStatus(GameStatus.GAME_OVER);
    gameBus.emit('GAME_OVER', fullResult);
  }, [gameId]);

  const emitScore = useCallback((result: GameResultPayload) => {
    const fullResult = { ...result, gameId } as GameResult;
    gameBus.emit('SCORE_SUBMIT', fullResult);
  }, [gameId]);

  const requestPause = useCallback(() => {
    setCurrentStatus(GameStatus.PAUSED);
    gameBus.emit('PAUSE_REQUESTED');
  }, []);

  return { emitGameOver, emitScore, requestPause, currentStatus };
};
