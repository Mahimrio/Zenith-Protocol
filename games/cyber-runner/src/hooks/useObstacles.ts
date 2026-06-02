/**
 * @file useObstacles.ts
 * @description Obstacle management.
 */
import { useRef, useCallback } from 'react';
import type { Obstacle } from '../utils/obstacleFactory';
import { ObstacleType, createObstacle } from '../utils/obstacleFactory';
import { useRunnerStore } from '../store/runnerStore';

export const useObstacles = () => {
  const obstacles = useRef<Obstacle[]>([]);
  const spawnTimer = useRef(0);
  const totalSpawned = useRef(0);

  const update = useCallback((gameSpeed: number, deltaTime: number, canvasWidth: number) => {
    spawnTimer.current -= deltaTime;
    if (spawnTimer.current <= 0) {
      const { speedLevel } = useRunnerStore.getState();
      const spawnInterval = Math.max(900, 2200 - (speedLevel - 1) * 130);
      spawnTimer.current = spawnInterval / 1000;

      const types = [ObstacleType.BARRIER, ObstacleType.LOW_BLOCK, ObstacleType.HOVER_MINE];
      const type = totalSpawned.current < 5 ? ObstacleType.BARRIER : types[Math.floor(Math.random() * types.length)];
      
      obstacles.current.push(createObstacle(type, canvasWidth + 100));
      totalSpawned.current++;
    }

    for (let i = obstacles.current.length - 1; i >= 0; i--) {
      obstacles.current[i].x -= gameSpeed * obstacles.current[i].speedMultiplier * deltaTime;
      if (obstacles.current[i].x < -100) {
        useRunnerStore.getState().incrementObstaclesAvoided();
        obstacles.current.splice(i, 1);
      }
    }

    return obstacles.current;
  }, []);

  const reset = useCallback(() => {
    obstacles.current = [];
    spawnTimer.current = 2.2;
    totalSpawned.current = 0;
  }, []);

  return { obstacles, update, reset, totalSpawned };
};
