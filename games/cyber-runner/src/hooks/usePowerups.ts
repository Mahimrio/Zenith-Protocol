/**
 * @file usePowerups.ts
 * @description Powerup management hook.
 */
import { useRef, useCallback } from 'react';
import type { Powerup } from '../utils/obstacleFactory';
import { PowerupType, createPowerup } from '../utils/obstacleFactory';

export const usePowerups = () => {
  const powerups = useRef<Powerup[]>([]);
  const spawnTimer = useRef(5); // First spawn after ~5s

  const update = useCallback((gameSpeed: number, deltaTime: number, canvasWidth: number, groundY: number) => {
    spawnTimer.current -= deltaTime;
    
    // Only one powerup on screen at a time
    if (spawnTimer.current <= 0 && powerups.current.length === 0) {
      spawnTimer.current = 8 + Math.random() * 6; // Next one in 8-14s
      
      const types = [PowerupType.SHIELD, PowerupType.GHOST, PowerupType.MAGNET, PowerupType.BOOST];
      const type = types[Math.floor(Math.random() * types.length)];
      
      powerups.current.push(createPowerup(type, canvasWidth + 100, groundY));
    }

    for (let i = powerups.current.length - 1; i >= 0; i--) {
      powerups.current[i].x -= gameSpeed * deltaTime;
      // Remove if culled or collected
      if (powerups.current[i].x < -50 || powerups.current[i].collected) {
        powerups.current.splice(i, 1);
      }
    }

    return powerups.current;
  }, []);

  const reset = useCallback(() => {
    powerups.current = [];
    spawnTimer.current = 5;
  }, []);

  return { update, reset };
};
