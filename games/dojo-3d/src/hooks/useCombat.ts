/**
 * @file useCombat.ts
 * @description Hook for hit detection logic.
 */
import { useDojoStore } from '../store/dojoStore';
import * as THREE from 'three';

export const useCombat = () => {
  const { enemies, killEnemy, takeDamage } = useDojoStore();

  const checkAttackHits = (attackPos: THREE.Vector3, range: number = 2) => {
    enemies.forEach(enemy => {
      const ePos = new THREE.Vector3(...enemy.position);
      if (attackPos.distanceTo(ePos) <= range) {
        killEnemy(enemy.id);
      }
    });
  };

  const processEnemyAttack = (damage: number) => {
    takeDamage(damage);
  };

  return { checkAttackHits, processEnemyAttack };
};
