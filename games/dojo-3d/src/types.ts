/**
 * @file types.ts
 * @description Interfaces for Dojo 3D game.
 */
export interface EnemyData {
  id: string;
  hp: number;
  maxHp: number;
  position: [number, number, number];
  type: 'BASIC' | 'ELITE';
  state: 'SPAWNING' | 'CHASE' | 'ATTACK' | 'DEAD';
}

export interface PlayerData {
  hp: number;
  maxHp: number;
  position: [number, number, number];
}
