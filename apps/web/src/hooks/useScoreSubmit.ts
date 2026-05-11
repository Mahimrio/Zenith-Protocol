/**
 * @file useScoreSubmit.ts
 * @description Hook to submit scores to backend game-specific session routes.
 */
import { useState, useCallback } from 'react';
import { GameResult } from '@sdk/types';
import { useAuth } from './useAuth';

interface ScoreSubmission {
  endpoint: string;
  payload: Record<string, number>;
}

const numberFrom = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildScoreSubmission = (result: GameResult): ScoreSubmission | null => {
  const metadata = result.metadata ?? {};

  if (result.gameId === 'dojo-3d') {
    const enemiesKilled = Math.max(0, Math.floor(numberFrom(metadata.enemiesKilled)));
    const wavesSurvived = Math.max(0, Math.floor(numberFrom(metadata.wave)));
    const survivalMs = Math.max(1000, Math.floor(numberFrom(metadata.survivedMs, 1000)));
    const rawCombo = Math.max(0, Math.floor(numberFrom(metadata.maxCombo, enemiesKilled)));

    return {
      endpoint: '/api/games/dojo/sessions',
      payload: {
        survival_ms: survivalMs,
        waves_survived: wavesSurvived,
        enemies_killed: enemiesKilled,
        score: Math.max(0, Math.floor(numberFrom(result.score))),
        max_combo: Math.min(rawCombo, enemiesKilled)
      }
    };
  }

  if (result.gameId === 'cyber-runner') {
    const distanceMeters = Math.max(1, Math.floor(numberFrom(metadata.distanceTraveled, result.score)));
    const finalSpeedLevel = Math.max(0, Math.floor(numberFrom(metadata.finalSpeedLevel, 1)));
    const peakSpeed = Math.min(1000, Math.max(280, 280 + (finalSpeedLevel * 20)));
    const obstaclesAvoided = Math.max(0, Math.floor(numberFrom(metadata.obstaclesAvoided, 0)));

    return {
      endpoint: '/api/games/runner/sessions',
      payload: {
        distance_meters: distanceMeters,
        peak_speed: peakSpeed,
        obstacles_avoided: obstaclesAvoided
      }
    };
  }

  return null;
};

export const useScoreSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();

  const submitScore = useCallback(async (result: GameResult, retries = 3): Promise<any> => {
    setIsSubmitting(true);
    setError(null);

    const submission = buildScoreSubmission(result);
    if (!submission) {
      return { skipped: true, reason: `No score endpoint configured for ${result.gameId}` };
    }
    if (!token) {
      throw new Error('Authentication token is required to submit scores.');
    }

    try {
      let lastError: Error | null = null;
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const response = await fetch(submission.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(submission.payload)
          });
          if (!response.ok) {
            throw new Error(`Failed to submit score: HTTP ${response.status}`);
          }
          return await response.json();
        } catch (attemptError: unknown) {
          lastError = attemptError instanceof Error ? attemptError : new Error('Failed to submit score');
        }
      }

      if (lastError) {
        throw lastError;
      }
      throw new Error('Failed to submit score');
    } catch (err: unknown) {
      const normalizedError = err instanceof Error ? err : new Error('Failed to submit score');
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setIsSubmitting(false);
    }
  }, [token]);

  return { submitScore, isSubmitting, error };
};
