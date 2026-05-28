/**
 * @file useEnemyAI.ts
 * @description Steering logic for enemies: chase, attack, and patrol.
 */
import { useRef } from 'react';
import * as THREE from 'three';
import { useDojoStore } from '../store/dojoStore';
import { useCombat } from './useCombat';

export const useEnemyAI = (_id: string, wave: number) => {
  const { player } = useDojoStore();
  const { processEnemyAttack } = useCombat();
  const lastAttack = useRef(0);
  const patrolTimer = useRef(0);
  const patrolDir = useRef<THREE.Vector3>(new THREE.Vector3(1, 0, 0));
  
  const update = (currentPos: THREE.Vector3) => {
    const pPos = new THREE.Vector3(...player.position);
    const dist = currentPos.distanceTo(pPos);
    
    let vel = new THREE.Vector3();
    if (dist < 15 && dist > 1.5) {
      // CHASE: move toward player with multiplicative speed scaling
      const baseSpeed = 2;
      const speedMultiplier = Math.min(Math.pow(1.1, wave - 1), 10);
      vel.subVectors(pPos, currentPos).normalize().multiplyScalar(baseSpeed * speedMultiplier);
    } else if (dist <= 1.5) {
      // ATTACK: stop and deal damage
      const now = Date.now();
      if (now - lastAttack.current > 1200) {
        processEnemyAttack(10 + wave * 2);
        lastAttack.current = now;
      }
    } else {
      // PATROL: random wandering when player is far
      const now = performance.now();
      if (now - patrolTimer.current > 2000) {
        patrolTimer.current = now;
        patrolDir.current = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          0,
          (Math.random() - 0.5) * 2
        ).normalize();
      }
      vel.copy(patrolDir.current).multiplyScalar(1.0);
    }
    return vel;
  };

  return { update };
};
