/**
 * @file usePlayerController.ts
 * @description Hook managing player inputs without re-renders.
 * Integrates SFX (punch, impact, wave-clear) and background music.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSound } from '@sdk/hooks/useSound';
import { useMusic } from '@sdk/hooks/useMusic';

export const usePlayerController = () => {
  const keys = useRef<{ [key: string]: boolean }>({});
  const attackCooldown = useRef(false);
  
  const state = useRef({
    velocity: new THREE.Vector3(),
    facing: 0,
    attacking: false
  });

  // ── Sound hooks ────────────────────────────────────────────
  const { play: playPunch } = useSound('/sounds/dojo/punch.mp3');
  const { play: playImpact } = useSound('/sounds/dojo/impact.mp3');
  const { play: playWaveClear } = useSound('/sounds/dojo/wave-clear.mp3');
  useMusic('/sounds/dojo/dojo-theme.mp3');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space' && !attackCooldown.current) {
        state.current.attacking = true;
        attackCooldown.current = true;
        playPunch();
        setTimeout(() => { state.current.attacking = false; }, 100);
        setTimeout(() => { attackCooldown.current = false; }, 500);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playPunch]);

  const update = () => {
    const speed = 5;
    const vel = new THREE.Vector3();
    
    if (keys.current['KeyW'] || keys.current['ArrowUp']) vel.z -= 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) vel.z += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) vel.x -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) vel.x += 1;
    
    if (vel.lengthSq() > 0) {
      vel.normalize().multiplyScalar(speed);
      state.current.facing = Math.atan2(vel.x, vel.z);
    }
    
    state.current.velocity.copy(vel);
    return state.current;
  };

  return { update, playImpact, playWaveClear };
};
