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
  const lastType = useRef<ObstacleType | null>(null);

  const ALL_TYPES: ObstacleType[] = [
    ObstacleType.TOXIC_PLANT,
    ObstacleType.SPIKE_CUBE,
    ObstacleType.CRYSTAL_CLUSTER,
    ObstacleType.LASER_FIELD,
  ];

  const pickRandom = (exclude: ObstacleType | null): ObstacleType => {
    const pool = exclude === null ? ALL_TYPES : ALL_TYPES.filter(t => t !== exclude);
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const update = useCallback((gameSpeed: number, deltaTime: number, canvasWidth: number) => {
    spawnTimer.current -= deltaTime;
    if (spawnTimer.current <= 0) {
      const { speedLevel } = useRunnerStore.getState();
      const baseInterval = Math.max(900, 1500 - (speedLevel - 1) * 70);
      const roll = Math.random();
      const jitter = roll < 0.15
        ? -(baseInterval * 0.25)
        : roll < 0.7
          ? (Math.random() - 0.5) * 250
          : baseInterval * (0.4 + Math.random() * 0.5);
      const spawnInterval = Math.max(800, baseInterval + jitter);
      spawnTimer.current = spawnInterval / 1000;

      const type = pickRandom(lastType.current);
      lastType.current = type;

      const spawnX = canvasWidth + 100;
      obstacles.current.push(createObstacle(type, spawnX));
    }

    for (let i = obstacles.current.length - 1; i >= 0; i--) {
      obstacles.current[i].x -= gameSpeed * obstacles.current[i].speedMultiplier * deltaTime;
      if (obstacles.current[i].x < -120) {
        useRunnerStore.getState().incrementObstaclesAvoided();
        obstacles.current.splice(i, 1);
      }
    }

    return obstacles.current;
  }, []);

  const reset = useCallback(() => {
    obstacles.current = [];
    spawnTimer.current = 0.3;
    lastType.current = null;
  }, []);

  return { obstacles, update, reset };
};
