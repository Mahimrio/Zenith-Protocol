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
  speedLevel: number;
  
  startGame: () => void;
  incrementDistance: (delta: number) => void;
  incrementObstaclesAvoided: () => void;
  incrementSpeedLevel: () => void;
  triggerGameOver: () => void;
}

export const useRunnerStore = create<RunnerState>((set) => ({
  distance: 0,
  gameStatus: GameStatus.IDLE,
  highScore: 0,
  obstaclesAvoided: 0,
  speedLevel: 1,

  startGame: () => set({ distance: 0, gameStatus: GameStatus.PLAYING, obstaclesAvoided: 0, speedLevel: 1 }),
  incrementDistance: (delta) => set((state) => ({ distance: state.distance + delta })),
  incrementObstaclesAvoided: () => set((state) => ({ obstaclesAvoided: state.obstaclesAvoided + 1 })),
  incrementSpeedLevel: () => set((state) => ({ speedLevel: state.speedLevel + 1 })),
  triggerGameOver: () => set((state) => ({ 
    gameStatus: GameStatus.GAME_OVER,
    highScore: Math.max(state.highScore, Math.floor(state.distance))
  }))
}));
