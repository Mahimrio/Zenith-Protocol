/**
 * @file dojoStore.ts
 * @description Zustand store for 3D Dojo state.
 */
import { create } from 'zustand';
import type { EnemyData, PlayerData } from '../types';
import { combatFormulas } from '../utils/combatFormulas';
import { GameStatus } from '@sdk/types';

interface DojoState {
  gameStatus: GameStatus;
  wave: number;
  score: number;
  survivedMs: number;
  startTime: number;
  player: PlayerData;
  enemies: EnemyData[];
  combo: number;
  lastKillTime: number;
  enemiesKilled: number;
  maxCombo: number;
  dyingEnemyIds: string[];
  
  startGame: () => void;
  takeDamage: (amount: number) => void;
  markEnemyDying: (id: string) => void;
  killEnemy: (id: string) => void;
  setEnemies: (enemies: EnemyData[]) => void;
  nextWave: () => void;
  setGameStatus: (status: GameStatus) => void;
  updatePlayerPos: (pos: [number, number, number]) => void;
}

export const useDojoStore = create<DojoState>((set, _get) => ({
  gameStatus: GameStatus.IDLE,
  wave: 1,
  score: 0,
  survivedMs: 0,
  startTime: 0,
  player: { hp: 100, maxHp: 100, position: [0, 1, 0] },
  enemies: [],
  combo: 0,
  lastKillTime: 0,
  enemiesKilled: 0,
  maxCombo: 0,
  dyingEnemyIds: [],

  startGame: () => set({ 
    gameStatus: GameStatus.PLAYING, 
    wave: 1, score: 0, combo: 0, 
    startTime: Date.now(),
    player: { hp: 100, maxHp: 100, position: [0, 1, 0] },
    enemies: [],
    enemiesKilled: 0,
    maxCombo: 0,
    dyingEnemyIds: []
  }),

  takeDamage: (amount) => set((state) => {
    if (state.gameStatus !== GameStatus.PLAYING) return state;
    const newHp = Math.max(0, state.player.hp - amount);
    if (newHp <= 0) {
      return { 
        player: { ...state.player, hp: 0 },
        gameStatus: GameStatus.GAME_OVER,
        survivedMs: Date.now() - state.startTime
      };
    }
    return { player: { ...state.player, hp: newHp }, combo: 0 };
  }),

  markEnemyDying: (id) => set((state) => ({
    dyingEnemyIds: [...state.dyingEnemyIds, id]
  })),

  killEnemy: (id) => set((state) => {
    const enemy = state.enemies.find(e => e.id === id);
    if (!enemy) return state;
    
    const now = Date.now();
    const isCombo = (now - state.lastKillTime) < 3000;
    const newCombo = isCombo ? state.combo + 1 : 1;
    
    const baseScore = combatFormulas.scoreForKill(state.wave, enemy.type);
    const comboMultiplier = 1 + (newCombo * 0.1);
    
    return {
      enemies: state.enemies.filter(e => e.id !== id),
      score: state.score + Math.floor(baseScore * comboMultiplier),
      combo: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      enemiesKilled: state.enemiesKilled + 1,
      lastKillTime: now,
      dyingEnemyIds: state.dyingEnemyIds.filter(did => did !== id)
    };
  }),

  setEnemies: (enemies) => set({ enemies }),
  nextWave: () => set((state) => ({ wave: state.wave + 1 })),
  setGameStatus: (status) => set({ gameStatus: status }),
  updatePlayerPos: (pos) => set((state) => ({ player: { ...state.player, position: pos } }))
}));
