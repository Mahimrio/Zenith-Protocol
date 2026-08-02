/**
 * @file types.ts
 * @description Types for Tactical Card Battler.
 */
export type CardType = 'attack' | 'defense' | 'spell' | 'utility';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type CardPlayAnimation = 'none' | 'slideIn' | 'flipIn';

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  power: number;
  effect?: string;
  rarity: CardRarity;
}

export interface CardInstance extends CardDefinition {
  instanceId: string;
  isFlipped?: boolean;
  isShaking?: boolean;
  isDying?: boolean;
  attackPower?: number;
  currentHp?: number;
  playAnimation?: CardPlayAnimation;
}
