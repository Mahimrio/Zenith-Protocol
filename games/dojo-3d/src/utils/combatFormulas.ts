/**
 * @file combatFormulas.ts
 * @description Pure functions for combat math.
 */
export const combatFormulas = {
  scoreForKill: (wave: number, type: 'BASIC' | 'ELITE') => {
    const base = type === 'ELITE' ? 500 : 100;
    return Math.floor(base * (1 + wave * 0.2));
  },
  damageGiven: (_wave: number) => {
    return 25;
  },
  damageTaken: (wave: number, type: 'BASIC' | 'ELITE') => {
    const base = type === 'ELITE' ? 20 : 10;
    return Math.floor(base * (1 + wave * 0.15));
  }
};
