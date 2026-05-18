/**
 * @file soundStore.ts
 * @description Zustand store for global sound settings with localStorage persistence.
 * Provides master, SFX, and music volume controls with a mute toggle.
 * Also exports a `playSfx` utility for use outside React (e.g. Zustand stores).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Howl } from 'howler';

interface SoundState {
  /** Master volume multiplier (0–1). Default 0.8. */
  masterVolume: number;
  /** SFX channel volume (0–1). Default 0.9. */
  sfxVolume: number;
  /** Music channel volume (0–1). Default 0.4. */
  musicVolume: number;
  /** Global mute flag. */
  isMuted: boolean;

  setMasterVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  toggleMute: () => void;

  /** Returns master × sfx (0 when muted). */
  getEffectiveSfxVolume: () => number;
  /** Returns master × music (0 when muted). */
  getEffectiveMusicVolume: () => number;
}

const clamp = (v: number): number => Math.max(0, Math.min(1, v));

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      masterVolume: 0.8,
      sfxVolume: 0.9,
      musicVolume: 0.4,
      isMuted: false,

      setMasterVolume: (v: number) => set({ masterVolume: clamp(v) }),
      setSfxVolume: (v: number) => set({ sfxVolume: clamp(v) }),
      setMusicVolume: (v: number) => set({ musicVolume: clamp(v) }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      getEffectiveSfxVolume: () => {
        const { masterVolume, sfxVolume, isMuted } = get();
        return isMuted ? 0 : masterVolume * sfxVolume;
      },
      getEffectiveMusicVolume: () => {
        const { masterVolume, musicVolume, isMuted } = get();
        return isMuted ? 0 : masterVolume * musicVolume;
      },
    }),
    {
      name: 'zenith-sound',
      partialize: (state) => ({
        masterVolume: state.masterVolume,
        sfxVolume: state.sfxVolume,
        musicVolume: state.musicVolume,
        isMuted: state.isMuted,
      }),
    },
  ),
);

/**
 * Play a one-shot SFX outside of React (e.g. from Zustand store actions).
 * Reads volume from the sound store at call time.
 * @param src - Path to the audio file
 */
export const playSfx = (src: string): void => {
  const { isMuted, masterVolume, sfxVolume } = useSoundStore.getState();
  if (isMuted) return;

  const howl = new Howl({
    src: [src],
    volume: masterVolume * sfxVolume,
  });
  howl.play();
};
