/**
 * @file useInputHandler.ts
 * @description Input mapping for jump/slide with SFX and background music.
 * Keyboard + touch via TouchControls overlay (no window-level touch listeners).
 */
import { useEffect } from 'react';
import { useSound } from '@sdk/hooks/useSound';
import { useMusic } from '@sdk/hooks/useMusic';

/**
 * Maps keyboard inputs to jump/slide actions.
 * Touch is handled by TouchControls overlay calling onJump/onSlide directly.
 * Plays SFX on each action and starts the cyber-runner music track.
 * @param onJump - Callback invoked when the player jumps
 * @param onSlide - Callback invoked when the player slides
 * @param isActive - Whether input handling is enabled
 */
export const useInputHandler = (onJump: () => void, onSlide: () => void, isActive: boolean) => {
  // ── Sound hooks ────────────────────────────────────────────
  const { play: playJump } = useSound('/sounds/runner/jump.mp3');
  const { play: playSlide } = useSound('/sounds/runner/slide.mp3');
  useMusic('/sounds/runner/cyber-beat.mp3');

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        playJump();
        onJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        playSlide();
        onSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onJump, onSlide, isActive, playJump, playSlide]);
};
