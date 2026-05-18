/**
 * @file useSound.ts
 * @description React hook for playing SFX via Howler.js.
 * Creates a Howl instance in useRef (never recreated on re-render).
 * Subscribes to soundStore volume changes and unloads on unmount.
 */
import { useRef, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { useSoundStore } from '../store/soundStore';

interface UseSoundReturn {
  /** Trigger the sound effect. */
  play: () => void;
  /** Stop playback and reset position. */
  stop: () => void;
  /** Pause playback at the current position. */
  pause: () => void;
  /** Whether the sound is currently playing. Ref-based (no re-render). */
  isPlaying: boolean;
}

/**
 * Hook for playing sound effects. Howl is created once and
 * auto-adjusts its volume when the global sound settings change.
 * @param src - Path to the audio file (relative to public/)
 * @returns Controls: play, stop, pause, isPlaying
 */
export const useSound = (src: string): UseSoundReturn => {
  const howlRef = useRef<Howl | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const vol = useSoundStore.getState().getEffectiveSfxVolume();

    const howl = new Howl({
      src: [src],
      volume: vol,
      preload: true,
      onplay: () => { isPlayingRef.current = true; },
      onend: () => { isPlayingRef.current = false; },
      onstop: () => { isPlayingRef.current = false; },
      onpause: () => { isPlayingRef.current = false; },
    });

    howlRef.current = howl;

    const unsubscribe = useSoundStore.subscribe((state) => {
      if (howlRef.current) {
        howlRef.current.volume(state.getEffectiveSfxVolume());
      }
    });

    return () => {
      unsubscribe();
      howlRef.current?.unload();
      howlRef.current = null;
    };
  }, [src]);

  const play = useCallback(() => {
    howlRef.current?.play();
  }, []);

  const stop = useCallback(() => {
    howlRef.current?.stop();
  }, []);

  const pause = useCallback(() => {
    howlRef.current?.pause();
  }, []);

  return { play, stop, pause, isPlaying: isPlayingRef.current };
};
