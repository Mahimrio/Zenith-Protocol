/**
 * @file useGameBridge.ts
 * @description React hook consumed by game modules to interact with the Host App.
 */
import { useEffect, useState, useCallback } from 'react';
import { gameBus } from './eventBus';
import type { GameResult, GameResultPayload } from './types';
import { GameStatus } from './types';

interface ScoreSubmission {
  endpoint: string;
  payload: Record<string, number>;
}

const numberFrom = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildScoreSubmission = (result: GameResult): ScoreSubmission | null => {
  switch (result.gameId) {
    case 'dojo-3d': {
      const metadata = result.metadata;
      const enemiesKilled = Math.max(0, Math.floor(numberFrom(metadata.enemiesKilled)));
      const wavesSurvived = Math.max(0, Math.floor(numberFrom(metadata.wave)));
      const survivalMs = Math.max(1000, Math.floor(numberFrom(metadata.survivedMs, 1000)));
      const rawCombo = Math.max(0, Math.floor(numberFrom(metadata.maxCombo, enemiesKilled)));
      const maxCombo = Math.min(rawCombo, enemiesKilled);

      return {
        endpoint: '/api/games/dojo/sessions',
        payload: {
          survival_ms: survivalMs,
          waves_survived: wavesSurvived,
          enemies_killed: enemiesKilled,
          score: Math.max(0, Math.floor(numberFrom(result.score))),
          max_combo: maxCombo,
        },
      };
    }
    case 'cyber-runner': {
      const metadata = result.metadata;
      const distanceMeters = Math.max(1, Math.floor(numberFrom(metadata.distanceTraveled, result.score)));
      const finalSpeedLevel = Math.max(0, Math.floor(numberFrom(metadata.finalSpeedLevel, 1)));
      const peakSpeed = Math.min(1000, Math.max(280, 280 + (finalSpeedLevel * 20)));
      const obstaclesAvoided = Math.max(0, Math.floor(numberFrom(metadata.obstaclesAvoided, 0)));

      return {
        endpoint: '/api/games/runner/sessions',
        payload: {
          distance_meters: distanceMeters,
          peak_speed: peakSpeed,
          obstacles_avoided: obstaclesAvoided,
        },
      };
    }
    case 'card-battler': {
      const metadata = result.metadata;
      const turnsSurvived = Math.max(1, Math.floor(numberFrom(metadata.turnsSurvived, 1)));
      const cardsPlayed = Math.max(0, Math.floor(numberFrom(metadata.cardsPlayed, 0)));
      const finalScore = Math.max(0, Math.floor(numberFrom(result.score)));

      return {
        endpoint: '/api/games/card/score',
        payload: {
          turns_survived: turnsSurvived,
          cards_played: cardsPlayed,
          final_score: finalScore,
        },
      };
    }
    default:
      return null;
  }
};

export const useGameBridge = (gameId: string) => {
  const [currentStatus, setCurrentStatus] = useState<GameStatus>(GameStatus.IDLE);

  useEffect(() => {
    setCurrentStatus(GameStatus.PLAYING);
    gameBus.emit('GAME_STARTED', { gameId });
    return () => {
      // Cleanups
    };
  }, [gameId]);

  const emitGameOver = useCallback((result: GameResultPayload, spectatorMode = false) => {
    const fullResult = { ...result, gameId } as GameResult;
    setCurrentStatus(GameStatus.GAME_OVER);
    gameBus.emit('GAME_OVER', fullResult);

    const token = localStorage.getItem('token');
    const submission = buildScoreSubmission(fullResult);
    if (!token || !submission || spectatorMode) {
      return;
    }

    void fetch(submission.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(submission.payload)
    })
      .then((response) => {
        if (!response.ok) {
          console.error(`Failed to submit ${gameId} score: HTTP ${response.status}`);
        }
      })
      .catch((error) => {
        console.error('Failed to submit score:', error);
      });
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
