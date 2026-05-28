/**
 * @file useObstacles.ts
 * @description Obstacle management.
 */
import { useRef } from 'react';
import type { Obstacle } from '../utils/obstacleFactory';
import { ObstacleType, createObstacle } from '../utils/obstacleFactory';
import { useRunnerStore } from '../store/runnerStore';

export const useObstacles = () => {
  const obstacles = useRef<Obstacle[]>([]);
  const spawnTimer = useRef(0);
  const totalSpawned = useRef(0);

  const update = (gameSpeed: number, deltaTime: number, canvasWidth: number) => {
    spawnTimer.current -= deltaTime;
    if (spawnTimer.current <= 0) {
      const baseSpawnRate = 1.5;
      const speedFactor = 280 / gameSpeed;
      spawnTimer.current = baseSpawnRate * speedFactor + Math.random() * 0.5;

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
  };

  const draw = (ctx: CanvasRenderingContext2D, groundLevel: number) => {
    obstacles.current.forEach(obs => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f59e0b';
      ctx.fillStyle = '#f59e0b';
      
      if (obs.type === ObstacleType.HOVER_MINE) {
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, groundLevel - obs.y - obs.height / 2, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.arc(obs.x + obs.width / 2, groundLevel - obs.y - obs.height / 2, obs.width / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(obs.x, groundLevel - obs.y - obs.height, obs.width, obs.height);
      }
      ctx.shadowBlur = 0;
    });
  };

  const reset = () => {
    obstacles.current = [];
    spawnTimer.current = 1.5;
    totalSpawned.current = 0;
  };

  return { obstacles, update, draw, reset, totalSpawned };
};
