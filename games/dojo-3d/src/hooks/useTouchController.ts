/**
 * @file useTouchController.ts
 * @description Touch-driven input controller for Dojo 3D mobile.
 *
 * Returns the same interface as usePlayerController (velocity, facing, attacking)
 * but driven by virtual joystick vector and attack button ref.
 */
import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { JoystickVector } from '../components/VirtualJoystick';

export const useTouchController = () => {
  const joystickVector = useRef<JoystickVector>({ x: 0, y: 0 });
  const attackTrigger = useRef(false);
  const attackCooldown = useRef(false);

  const state = useRef({
    velocity: new THREE.Vector3(),
    facing: 0,
    attacking: false,
  });

  const setJoystickVector = useCallback((vector: JoystickVector) => {
    joystickVector.current = vector;
  }, []);

  const triggerAttack = useCallback(() => {
    if (attackCooldown.current) return;
    attackTrigger.current = true;
    attackCooldown.current = true;
    setTimeout(() => { attackTrigger.current = false; }, 100);
    setTimeout(() => { attackCooldown.current = false; }, 500);
  }, []);

  const update = () => {
    const speed = 5;
    const vel = new THREE.Vector3();
    const joy = joystickVector.current;

    if (joy.x !== 0 || joy.y !== 0) {
      vel.x = joy.x * speed;
      vel.z = joy.y * speed;
      state.current.facing = Math.atan2(joy.x, joy.y);
    }

    if (attackTrigger.current) {
      state.current.attacking = true;
    } else {
      state.current.attacking = false;
    }

    state.current.velocity.copy(vel);
    return state.current;
  };

  return { update, setJoystickVector, triggerAttack };
};
