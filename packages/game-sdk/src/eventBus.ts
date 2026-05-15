/**
 * @file eventBus.ts
 * @description Typed event emitter using mitt for inter-module communication.
 */
import mitt from 'mitt';
import type { GameResult } from './types';

type Events = {
  GAME_STARTED: { gameId: string };
  GAME_OVER: GameResult;
  SCORE_SUBMIT: GameResult;
  PAUSE_REQUESTED: void;
  RESUME_REQUESTED: void;
  NAVIGATE_HOME: void;
};

export const gameBus = mitt<Events>();
