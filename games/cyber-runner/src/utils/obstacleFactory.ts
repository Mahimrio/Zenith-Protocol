/**
 * @file obstacleFactory.ts
 * @description Factory for creating obstacles.
 */
export const ObstacleType = {
  BARRIER: 'BARRIER',
  LOW_BLOCK: 'LOW_BLOCK',
  HOVER_MINE: 'HOVER_MINE',
} as const;
export type ObstacleType = typeof ObstacleType[keyof typeof ObstacleType];

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speedMultiplier: number;
  rotation: number;
}

export const createObstacle = (type: ObstacleType, startX: number): Obstacle => {
  const id = Math.random().toString(36).slice(2, 11);
  switch (type) {
    case ObstacleType.BARRIER:
      return { id, type, x: startX, y: 0, width: 28, height: 104, speedMultiplier: 1, rotation: 0 };
    case ObstacleType.LOW_BLOCK:
      return { id, type, x: startX, y: 0, width: 60, height: 38, speedMultiplier: 1, rotation: 0 };
    case ObstacleType.HOVER_MINE:
      return { id, type, x: startX, y: 120, width: 36, height: 36, speedMultiplier: 1, rotation: 0 };
  }
};

export const PowerupType = {
  SHIELD: 'SHIELD',
  GHOST: 'GHOST',
  MAGNET: 'MAGNET',
  BOOST: 'BOOST',
} as const;
export type PowerupType = typeof PowerupType[keyof typeof PowerupType];

export interface Powerup {
  id: string;
  type: PowerupType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export const createPowerup = (type: PowerupType, x: number, groundY: number): Powerup => {
  const id = Math.random().toString(36).slice(2, 11);
  return { id, type, x, y: groundY - 55, width: 24, height: 24, collected: false };
};
