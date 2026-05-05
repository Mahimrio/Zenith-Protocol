/**
 * @file pluginLoader.ts
 * @description Dynamic plugin loader for Zenith Protocol game modules.
 */
import { lazy } from 'react';
import { GameManifest } from '@sdk/types';
import { useGameStore } from '../store/gameStore';

export const registerGame = (manifest: GameManifest): void => {
  useGameStore.getState().registerGame(manifest);
};

export const launchGamePlugin = (gameId: string) => {
  const gameMap: Record<string, () => Promise<any>> = {
    'dojo-3d': () => import('@games/dojo-3d/src/index'),
    'card-battler': () => import('@games/card-battler/src/index'),
    'cyber-runner': () => import('@games/cyber-runner/src/index'),
  };

  if (!gameMap[gameId]) {
    return null;
  }

  return lazy(gameMap[gameId]);
};
