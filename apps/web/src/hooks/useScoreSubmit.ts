/**
 * @file useScoreSubmit.ts
 * @description Hook to submit scores to backend game-specific session routes.
 */
import { useState, useCallback } from 'react';
import type { GameResult } from '@sdk/types';
import { useAuth } from './useAuth';
import { useAuthStore } from '../store/authStore';

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
          obstacles_avoided: obstaclesAvoided
        }
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
          final_score: finalScore
        }
      };
    }
    default:
      return null;
  }
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
          
          const data = await response.json();
          
          // Refresh user data to get updated total_score
          try {
            const userRes = await fetch('/api/user', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              useAuthStore.getState().updateUser(userData);
            }
          } catch (e) {
            console.error('Failed to refresh user data', e);
          }

          return data;
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
