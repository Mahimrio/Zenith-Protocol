/**
 * @file gameStore.ts
 * @description Zustand store for tracking registered games and active game state.
 */
import { create } from 'zustand';
import type { GameManifest } from '@sdk/types';

interface GameState {
  registeredGames: GameManifest[];
  activeGame: string | null;
  registerGame: (manifest: GameManifest) => void;
  launchGame: (gameId: string) => void;
  closeGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  registeredGames: [],
  activeGame: null,
  registerGame: (manifest) => set((state) => ({
    registeredGames: [...state.registeredGames, manifest]
  })),
  launchGame: (gameId) => set({ activeGame: gameId }),
  closeGame: () => set({ activeGame: null })
}));
