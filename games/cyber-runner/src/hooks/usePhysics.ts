/**
 * @file usePhysics.ts
 * @description Player physics for the runner.
 */
import { useRef } from 'react';

export const usePhysics = () => {
  const GRAVITY = 1800;
  const JUMP_FORCE = -620;
  const PLAYER_X = 120;

  const state = useRef({
    y: 0,
    vy: 0,
    isGrounded: true,
    isSliding: false,
    slideTimer: 0
  });

  const update = (deltaTime: number, groundLevel: number) => {
    if (!state.current.isGrounded) {
      state.current.vy += GRAVITY * deltaTime;
    }
    
    state.current.y += state.current.vy * deltaTime;
    
    if (state.current.y >= groundLevel) {
      state.current.y = groundLevel;
      state.current.vy = 0;
      state.current.isGrounded = true;
    }

    if (state.current.isSliding) {
      state.current.slideTimer -= deltaTime;
      if (state.current.slideTimer <= 0) {
        state.current.isSliding = false;
      }
    }
    
    return { ...state.current, x: PLAYER_X };
  };

  const jump = () => {
    if (state.current.isGrounded) {
      state.current.vy = JUMP_FORCE;
      state.current.isGrounded = false;
      state.current.isSliding = false;
    }
  };

  const slide = () => {
    if (state.current.isGrounded && !state.current.isSliding) {
      state.current.isSliding = true;
      state.current.slideTimer = 0.6;
    }
  };

  return { state, update, jump, slide };
};
