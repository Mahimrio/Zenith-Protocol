/**
 * @file useMusic.ts
 * @description React hook for looping background music via Howler.js.
 * Singleton pattern — mounting a new music track stops the previous one.
 * Auto-fades in on mount and fades out on unmount.
 */
import { useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { useSoundStore } from '../store/soundStore';

/** Module-level singleton: only one music track active at a time. */
let currentMusicHowl: Howl | null = null;

interface UseMusicReturn {
  /** Start playback (resumes if paused). */
  play: () => void;
  /** Stop playback and reset position. */
  stop: () => void;
  /** Fade volume from 0 to the effective music volume. */
  fadeIn: (durationMs?: number) => void;
  /** Fade volume to 0. */
  fadeOut: (durationMs?: number) => void;
}

/**
 * Hook for background music with auto-fade and global singleton behaviour.
 * When a component using this hook mounts, any previously-playing music
 * fades out and is replaced by the new track.
 * @param src - Path to the music file (relative to public/)
 * @returns Controls: play, stop, fadeIn, fadeOut
 */
export const useMusic = (src: string): UseMusicReturn => {
  const howlRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Fade-out and dispose of previous singleton track
    if (currentMusicHowl) {
      const prev = currentMusicHowl;
      prev.fade(prev.volume(), 0, 500);
      setTimeout(() => prev.unload(), 600);
      currentMusicHowl = null;
    }

    const effectiveVol = useSoundStore.getState().getEffectiveMusicVolume();

    const howl = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      preload: true,
    });

    howlRef.current = howl;
    currentMusicHowl = howl;

    // Auto fade-in
    howl.play();
    howl.fade(0, effectiveVol, 1500);

    // React to global volume changes while playing
    const unsubscribe = useSoundStore.subscribe((state) => {
      if (howlRef.current?.playing()) {
        howlRef.current.volume(state.getEffectiveMusicVolume());
      }
    });

    return () => {
      unsubscribe();
      if (howlRef.current) {
        const h = howlRef.current;
        h.fade(h.volume(), 0, 800);
        setTimeout(() => h.unload(), 900);
        if (currentMusicHowl === h) currentMusicHowl = null;
      }
      howlRef.current = null;
    };
  }, [src]);

  const play = useCallback(() => {
    howlRef.current?.play();
  }, []);

  const stop = useCallback(() => {
    howlRef.current?.stop();
  }, []);

  const fadeIn = useCallback((durationMs = 1500) => {
    if (!howlRef.current) return;
    const vol = useSoundStore.getState().getEffectiveMusicVolume();
    if (!howlRef.current.playing()) howlRef.current.play();
    howlRef.current.fade(0, vol, durationMs);
  }, []);

  const fadeOut = useCallback((durationMs = 1500) => {
    if (!howlRef.current) return;
    howlRef.current.fade(howlRef.current.volume(), 0, durationMs);
  }, []);

  return { play, stop, fadeIn, fadeOut };
};
