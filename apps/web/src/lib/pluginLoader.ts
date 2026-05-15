/**
 * @file pluginLoader.ts
 * @description Dynamic plugin loader for Zenith Protocol game modules.
 */
import { lazy, ComponentType } from 'react';
import type { GameManifest } from '@sdk/types';
import { useGameStore } from '../store/gameStore';

export const registerGame = (manifest: GameManifest): void => {
  useGameStore.getState().registerGame(manifest);
};

const gameComponents: Record<string, ReturnType<typeof lazy>> = {
  'dojo-3d': lazy(() => import('@games/dojo-3d/src/index') as Promise<{ default: ComponentType<unknown> }>),
  'card-battler': lazy(() => import('@games/card-battler/src/index') as Promise<{ default: ComponentType<unknown> }>),
  'cyber-runner': lazy(() => import('@games/cyber-runner/src/index') as Promise<{ default: ComponentType<unknown> }>),
};

export const launchGamePlugin = (gameId: string) => {
  return gameComponents[gameId] || null;
};
