/**
 * @file types.ts
 * @description Core types and interfaces shared across all game modules and the Host App.
 */

export const GameStatus = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
} as const
export type GameStatus = typeof GameStatus[keyof typeof GameStatus]

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

// ── Per-game metadata types ──────────────────────────────────────────

export interface DojoMetadata {
  wave: number;
  survivedMs: number;
  enemiesKilled: number;
  maxCombo?: number;
}

export interface RunnerMetadata {
  distanceTraveled: number;
  finalSpeedLevel: number;
  obstaclesAvoided?: number;
}

export interface CardBattlerMetadata {
  turnsSurvived: number;
  cardsPlayed: number;
  finalEnemyHp?: number;
}

// ── Discriminated union for game results ─────────────────────────────

export interface DojoGameResult {
  gameId: 'dojo-3d';
  userId?: string;
  score: number;
  metadata: DojoMetadata;
  completedAt: string;
}

export interface RunnerGameResult {
  gameId: 'cyber-runner';
  userId?: string;
  score: number;
  metadata: RunnerMetadata;
  completedAt: string;
}

export interface CardBattlerGameResult {
  gameId: 'card-battler';
  userId?: string;
  score: number;
  metadata: CardBattlerMetadata;
  completedAt: string;
}

export type GameResult = DojoGameResult | RunnerGameResult | CardBattlerGameResult;

/**
 * Payload type used by game modules when calling `emitGameOver`.
 * The `gameId` is injected by the bridge, so modules only need to provide the rest.
 */
export type GameResultPayload = Omit<GameResult, 'gameId'>;

