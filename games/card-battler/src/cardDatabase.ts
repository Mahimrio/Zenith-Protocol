/**
 * @file cardDatabase.ts
 * @description Card definitions.
 */
import { CardDefinition } from './types';

export const allCards: CardDefinition[] = [
  // 10 Attack Cards
  { id: 'a1', name: 'Strike', type: 'attack', cost: 1, power: 2, rarity: 'common' },
  { id: 'a2', name: 'Slash', type: 'attack', cost: 2, power: 4, rarity: 'common' },
  { id: 'a3', name: 'Cleave', type: 'attack', cost: 3, power: 6, rarity: 'common' },
  { id: 'a4', name: 'Thrust', type: 'attack', cost: 1, power: 3, effect: 'Pierce shields', rarity: 'rare' },
  { id: 'a5', name: 'Heavy Blow', type: 'attack', cost: 4, power: 8, rarity: 'rare' },
  { id: 'a6', name: 'Double Strike', type: 'attack', cost: 3, power: 5, effect: 'Attacks twice', rarity: 'rare' },
  { id: 'a7', name: 'Execute', type: 'attack', cost: 5, power: 12, rarity: 'rare' },
  { id: 'a8', name: 'Flurry', type: 'attack', cost: 2, power: 3, effect: 'Draw 1 card', rarity: 'rare' },
  { id: 'a9', name: 'Mirror Slash', type: 'attack', cost: 7, power: 10, effect: 'Attacks all enemies', rarity: 'legendary' },
  { id: 'a10', name: 'Obliterate', type: 'attack', cost: 9, power: 20, effect: 'Destroy instantly', rarity: 'legendary' },

  // 6 Defense Cards
  { id: 'd1', name: 'Block', type: 'defense', cost: 1, power: 2, rarity: 'common' },
  { id: 'd2', name: 'Shield', type: 'defense', cost: 2, power: 5, rarity: 'common' },
  { id: 'd3', name: 'Barricade', type: 'defense', cost: 4, power: 10, rarity: 'rare' },
  { id: 'd4', name: 'Deflect', type: 'defense', cost: 3, power: 6, effect: 'Reflect 50% damage', rarity: 'rare' },
  { id: 'd5', name: 'Stone Wall', type: 'defense', cost: 6, power: 15, effect: 'Immune to damage this turn', rarity: 'legendary' },
  { id: 'd6', name: 'Aegis', type: 'defense', cost: 8, power: 25, rarity: 'legendary' },

  // 4 Spell Cards
  { id: 's1', name: 'Fireball', type: 'spell', cost: 3, power: 6, effect: 'Burn 2 damage over time', rarity: 'common' },
  { id: 's2', name: 'Heal', type: 'spell', cost: 2, power: 5, effect: 'Restore HP', rarity: 'common' },
  { id: 's3', name: 'Frost Nova', type: 'spell', cost: 4, power: 4, effect: 'Freeze enemy turn', rarity: 'rare' },
  { id: 's4', name: 'Void Surge', type: 'spell', cost: 5, power: 0, effect: 'Draw 3 cards', rarity: 'legendary' }
];

export const getRandomDeck = (size: number): CardDefinition[] => {
  const deck: CardDefinition[] = [];
  for (let i = 0; i < size; i++) {
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    deck.push(randomCard);
  }
  return deck;
};
