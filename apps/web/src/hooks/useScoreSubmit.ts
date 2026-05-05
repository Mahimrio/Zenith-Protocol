/**
 * @file useScoreSubmit.ts
 * @description Hook to handle API call for POST /api/scores.
 */
import { useState, useCallback } from 'react';
import { GameResult } from '@sdk/types';
import { useAuth } from './useAuth';

export const useScoreSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();

  const submitScore = useCallback(async (result: GameResult, retries = 3): Promise<any> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(result)
      });
      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
      return await response.json();
    } catch (err: any) {
      if (retries > 0) {
        return submitScore(result, retries - 1);
      }
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [token]);

  return { submitScore, isSubmitting, error };
};
