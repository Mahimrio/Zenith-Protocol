/**
 * @file types.ts
 * @description Types for Tactical Card Battler.
 */
export type CardType = 'attack' | 'defense' | 'spell';

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  power: number;
  effect?: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface CardInstance extends CardDefinition {
  instanceId: string;
  isFlipped?: boolean;
}
