/**
 * @file runnerStore.ts
 * @description Zustand store for Cyber Runner UI state.
 */
import { create } from 'zustand';
import { GameStatus } from '@sdk/types';
import { type PowerupType } from '../utils/obstacleFactory';

export const RUNNER_SPEED = {
  INITIAL_SPEED: 160,
  SPEED_INCREMENT: 12,
  SPEED_INTERVAL: 15,
  MAX_SPEED: 520,
} as const;

interface RunnerState {
  distance: number;
  gameStatus: GameStatus;
  highScore: number;
  obstaclesAvoided: number;
  speedLevel: number;
  
  activePowerup: PowerupType | null;
  powerupExpiresAt: number;
  shieldActive: boolean;
  ghostActive: boolean;
  scoreMultiplier: number;
  
  startGame: () => void;
  incrementDistance: (delta: number) => void;
  incrementObstaclesAvoided: () => void;
  incrementSpeedLevel: () => void;
  triggerGameOver: () => void;
  activatePowerup: (type: PowerupType) => void;
  deactivatePowerup: () => void;
}

export const useRunnerStore = create<RunnerState>((set) => ({
  distance: 0,
  gameStatus: GameStatus.IDLE,
  highScore: 0,
  obstaclesAvoided: 0,
  speedLevel: 1,

  activePowerup: null,
  powerupExpiresAt: 0,
  shieldActive: false,
  ghostActive: false,
  scoreMultiplier: 1,

  startGame: () => set({ 
    distance: 0, 
    gameStatus: GameStatus.PLAYING, 
    obstaclesAvoided: 0, 
    speedLevel: 1,
    activePowerup: null,
    powerupExpiresAt: 0,
    shieldActive: false,
    ghostActive: false,
    scoreMultiplier: 1
  }),
  incrementDistance: (delta) => set((state) => ({ distance: state.distance + (delta * state.scoreMultiplier) })),
  incrementObstaclesAvoided: () => set((state) => ({ obstaclesAvoided: state.obstaclesAvoided + 1 })),
  incrementSpeedLevel: () => set((state) => ({ speedLevel: state.speedLevel + 1 })),
  triggerGameOver: () => set((state) => ({ 
    gameStatus: GameStatus.GAME_OVER,
    highScore: Math.max(state.highScore, Math.floor(state.distance))
  })),

  activatePowerup: (type) => set(() => ({
    activePowerup: type,
    powerupExpiresAt: Date.now() + 6000,
    shieldActive: type === 'SHIELD',
    ghostActive: type === 'GHOST',
    scoreMultiplier: type === 'MAGNET' ? 2 : 1,
  })),

  deactivatePowerup: () => set(() => ({
    activePowerup: null,
    powerupExpiresAt: 0,
    shieldActive: false,
    ghostActive: false,
    scoreMultiplier: 1,
  }))
}));
