/**
 * @file EnemySpawner.tsx
 * @description Renders current enemies.
 */
import React from 'react';
import { useDojoStore } from '../store/dojoStore';
import { Enemy } from './Enemy';

export const EnemySpawner: React.FC = () => {
  const enemies = useDojoStore(state => state.enemies);
  return (
    <group>
      {enemies.map(enemy => (
        <Enemy key={enemy.id} data={enemy} />
      ))}
    </group>
  );
};
