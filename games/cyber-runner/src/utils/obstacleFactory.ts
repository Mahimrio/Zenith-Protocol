/**
 * @file obstacleFactory.ts
 * @description Factory for creating obstacles.
 */
export const ObstacleType = {
  TOXIC_PLANT: 'TOXIC_PLANT',
  SPIKE_CUBE: 'SPIKE_CUBE',
  CRYSTAL_CLUSTER: 'CRYSTAL_CLUSTER',
  LASER_FIELD: 'LASER_FIELD',
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
  phase: number;
}

export const createObstacle = (type: ObstacleType, startX: number): Obstacle => {
  const id = Math.random().toString(36).slice(2, 11);
  const phase = Math.random() * Math.PI * 2;
  switch (type) {
    case ObstacleType.TOXIC_PLANT:
      return { id, type, x: startX, y: 0, width: 56, height: 96, speedMultiplier: 1, rotation: 0, phase };
    case ObstacleType.SPIKE_CUBE:
      return { id, type, x: startX, y: 62, width: 52, height: 52, speedMultiplier: 1, rotation: 0, phase };
    case ObstacleType.CRYSTAL_CLUSTER:
      return { id, type, x: startX, y: 0, width: 64, height: 54, speedMultiplier: 1, rotation: 0, phase };
    case ObstacleType.LASER_FIELD:
      return { id, type, x: startX, y: 62, width: 44, height: 90, speedMultiplier: 1, rotation: 0, phase };
  }
};
