/**
 * @file types.ts
 * @description Core types and interfaces shared across all game modules and the Host App.
 */

export enum GameStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export interface GameManifest {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  route: string;
  component: string;
  minPlayers: number;
  maxPlayers: number;
  tags: string[];
}

export interface GameResult {
  gameId: string;
  userId?: string;
  score: number;
  metadata?: Record<string, unknown>;
  completedAt: string;
}
