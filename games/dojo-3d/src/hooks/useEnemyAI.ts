/**
 * @file useEnemyAI.ts
 * @description Basic steering logic for enemies.
 */
import { useRef } from 'react';
import * as THREE from 'three';
import { useDojoStore } from '../store/dojoStore';
import { useCombat } from './useCombat';

export const useEnemyAI = (id: string, wave: number) => {
  const { player } = useDojoStore();
  const { processEnemyAttack } = useCombat();
  const lastAttack = useRef(0);
  
  const update = (currentPos: THREE.Vector3) => {
    const pPos = new THREE.Vector3(...player.position);
    const dist = currentPos.distanceTo(pPos);
    
    let vel = new THREE.Vector3();
    if (dist < 15 && dist > 1.2) {
      vel.subVectors(pPos, currentPos).normalize().multiplyScalar(2 + (wave * 0.2));
    } else if (dist <= 1.2) {
      const now = Date.now();
      if (now - lastAttack.current > 1200) {
        processEnemyAttack(10 + wave * 2);
        lastAttack.current = now;
      }
    }
    return vel;
  };

  return { update };
};
