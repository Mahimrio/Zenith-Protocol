/**
 * @file usePhysics.ts
 * @description Player physics for the runner.
 */
import { useRef } from 'react';

export const usePhysics = () => {
  const GRAVITY = 900;
  const JUMP_FORCE = -600;
  const PLAYER_X = 120;

  const state = useRef({
    y: 0,
    vy: 0,
    isGrounded: false,
    isSliding: false,
    slideTimer: 0,
    jumpTime: 0,
    jumpOffset: 0
  });

  const FORWARD_OFFSET = 25;

  const update = (deltaTime: number, groundLevel: number) => {
    if (!state.current.isGrounded) {
      state.current.vy += GRAVITY * deltaTime;
      state.current.jumpTime += deltaTime;
      const airTime = (2 * Math.abs(JUMP_FORCE)) / GRAVITY;
      const t = Math.min(state.current.jumpTime / airTime, 1);
      state.current.jumpOffset = Math.sin(t * Math.PI) * FORWARD_OFFSET;
    } else {
      state.current.jumpTime = 0;
      state.current.jumpOffset = 0;
    }

    state.current.y += state.current.vy * deltaTime;

    if (state.current.y >= groundLevel) {
      state.current.y = groundLevel;
      state.current.vy = 0;
      state.current.isGrounded = true;
    }

    return { ...state.current, x: PLAYER_X + state.current.jumpOffset };
  };

  const jump = () => {
    if (state.current.isGrounded) {
      state.current.vy = JUMP_FORCE;
      state.current.isGrounded = false;
      state.current.isSliding = false;
      state.current.jumpTime = 0;
    }
  };

  const slide = () => {
    if (state.current.isGrounded && !state.current.isSliding) {
      state.current.isSliding = true;
    }
  };

  const stopSlide = () => {
    state.current.isSliding = false;
  };

  return { state, update, jump, slide, stopSlide };
};
