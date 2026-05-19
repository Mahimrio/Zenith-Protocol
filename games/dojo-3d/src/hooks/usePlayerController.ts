/**
 * @file usePlayerController.ts
 * @description Hook managing player inputs without re-renders.
 * Detects touch device — uses touch controller on mobile, keyboard on desktop.
 * Integrates SFX (punch, impact, wave-clear) and background music.
 */
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useSound } from '@sdk/hooks/useSound';
import { useMusic } from '@sdk/hooks/useMusic';
import { useIsMobile } from '@sdk/utils/device';
import type { JoystickVector } from '../components/VirtualJoystick';

export const usePlayerController = () => {
  const isMobile = useIsMobile();
  const keys = useRef<{ [key: string]: boolean }>({});
  const attackCooldown = useRef(false);
  const joystickVector = useRef<JoystickVector>({ x: 0, y: 0 });
  const touchAttackTrigger = useRef(false);
  const touchAttackCooldown = useRef(false);

  const state = useRef({
    velocity: new THREE.Vector3(),
    facing: 0,
    attacking: false,
  });

  // ── Sound hooks ────────────────────────────────────────────
  const { play: playPunch } = useSound('/sounds/dojo/punch.mp3');
  const { play: playImpact } = useSound('/sounds/dojo/impact.mp3');
  const { play: playWaveClear } = useSound('/sounds/dojo/wave-clear.mp3');
  useMusic('/sounds/dojo/dojo-theme.mp3');

  // ── Keyboard listeners (desktop only) ──────────────────────
  useEffect(() => {
    if (isMobile) return;

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
  }, [isMobile, playPunch]);

  // ── Touch input setters (called by VirtualJoystick/AttackButton) ─
  const setJoystickVector = useCallback((vector: JoystickVector) => {
    joystickVector.current = vector;
  }, []);

  const triggerTouchAttack = useCallback(() => {
    if (touchAttackCooldown.current) return;
    touchAttackTrigger.current = true;
    touchAttackCooldown.current = true;
    playPunch();
    setTimeout(() => { touchAttackTrigger.current = false; }, 100);
    setTimeout(() => { touchAttackCooldown.current = false; }, 500);
  }, [playPunch]);

  const update = () => {
    const speed = 5;
    const vel = new THREE.Vector3();

    if (isMobile) {
      // Touch-driven input
      const joy = joystickVector.current;
      if (joy.x !== 0 || joy.y !== 0) {
        vel.x = joy.x * speed;
        vel.z = joy.y * speed;
        state.current.facing = Math.atan2(joy.x, joy.y);
      }
      if (touchAttackTrigger.current) {
        state.current.attacking = true;
      } else {
        state.current.attacking = false;
      }
    } else {
      // Keyboard-driven input
      if (keys.current['KeyW'] || keys.current['ArrowUp']) vel.z -= 1;
      if (keys.current['KeyS'] || keys.current['ArrowDown']) vel.z += 1;
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) vel.x -= 1;
      if (keys.current['KeyD'] || keys.current['ArrowRight']) vel.x += 1;

      if (vel.lengthSq() > 0) {
        vel.normalize().multiplyScalar(speed);
        state.current.facing = Math.atan2(vel.x, vel.z);
      }
    }

    state.current.velocity.copy(vel);
    return state.current;
  };

  return { update, playImpact, playWaveClear, setJoystickVector, triggerTouchAttack };
};
