/**
 * @file runnerStore.ts
 * @description Zustand store for Cyber Runner UI state.
 */
import { create } from 'zustand';
import { GameStatus } from '@sdk/types';

interface RunnerState {
  distance: number;
  gameStatus: GameStatus;
  highScore: number;
  obstaclesAvoided: number;
  
  startGame: () => void;
  incrementDistance: (delta: number) => void;
  incrementObstaclesAvoided: () => void;
  triggerGameOver: () => void;
}

export const useRunnerStore = create<RunnerState>((set) => ({
  distance: 0,
  gameStatus: GameStatus.IDLE,
  highScore: 0,
  obstaclesAvoided: 0,

  startGame: () => set({ distance: 0, gameStatus: GameStatus.PLAYING, obstaclesAvoided: 0 }),
  incrementDistance: (delta) => set((state) => ({ distance: state.distance + delta })),
  incrementObstaclesAvoided: () => set((state) => ({ obstaclesAvoided: state.obstaclesAvoided + 1 })),
  triggerGameOver: () => set((state) => ({ 
    gameStatus: GameStatus.GAME_OVER,
    highScore: Math.max(state.highScore, Math.floor(state.distance))
  }))
}));
