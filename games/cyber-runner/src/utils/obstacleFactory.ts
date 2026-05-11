/**
 * @file obstacleFactory.ts
 * @description Factory for creating obstacles.
 */
export enum ObstacleType {
  BARRIER,
  LOW_BLOCK,
  HOVER_MINE
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speedMultiplier: number;
}

export const createObstacle = (type: ObstacleType, startX: number): Obstacle => {
  const id = Math.random().toString(36).slice(2, 11);
  switch (type) {
    case ObstacleType.BARRIER:
      return { id, type, x: startX, y: 0, width: 30, height: 80, speedMultiplier: 1 };
    case ObstacleType.LOW_BLOCK:
      return { id, type, x: startX, y: 0, width: 60, height: 40, speedMultiplier: 1 };
    case ObstacleType.HOVER_MINE:
      return { id, type, x: startX, y: 70, width: 30, height: 30, speedMultiplier: 1 };
  }
};
