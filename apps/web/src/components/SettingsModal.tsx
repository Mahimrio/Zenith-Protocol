/**
 * @file SettingsModal.tsx
 * @description Full-screen settings modal with GSAP entrance animation.
 * Sections: Audio (master / sfx / music volumes + mute), Account.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSoundStore } from '@sdk/store/soundStore';
import { GlassCard } from '@ui/GlassCard';
import { NeonButton } from '@ui/NeonButton';
import { VolumeControl } from './VolumeControl';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SettingsModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
}

/**
 * Centered glass modal with GSAP scale+opacity entrance.
 * Closes on X button or clicking the dark overlay.
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const {
    masterVolume, sfxVolume, musicVolume, isMuted,
    setMasterVolume, setSfxVolume, setMusicVolume, toggleMute,
  } = useSoundStore();

  /* ── GSAP entrance / exit ───────────────────────────────────── */
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;

    if (isOpen) {
      gsap.set(overlayRef.current, { display: 'flex' });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(
        panelRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' },
      );
    } else {
      gsap.to(panelRef.current, { scale: 0.9, opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(overlayRef.current, {
        opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: () => { if (overlayRef.current) gsap.set(overlayRef.current, { display: 'none' }); },
      });
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[100] items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ display: 'none', opacity: 0 }}
    >
      <GlassCard className="relative w-full max-w-sm mx-4 p-6 shadow-2xl" glowColor="neon-cyan">
        <div ref={panelRef}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold tracking-widest text-text-primary">
              SETTINGS
            </h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-neon-cyan transition-colors p-1"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── AUDIO Section ──────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-neon-cyan shadow-[0_0_6px_#00f5ff]" />
              <span className="text-xs font-semibold tracking-widest text-text-muted uppercase">Audio</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <VolumeControl label="Master" value={masterVolume} onChange={setMasterVolume} />
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isMuted
                      ? 'text-red-400 bg-red-400/10'
                      : 'text-text-muted hover:text-neon-cyan hover:bg-glass'
                  }`}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              </div>

              <VolumeControl label="SFX" value={sfxVolume} onChange={setSfxVolume} />
              <VolumeControl label="Music" value={musicVolume} onChange={setMusicVolume} />
            </div>
          </div>

          {/* ── ACCOUNT Section ────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-neon-purple shadow-[0_0_6px_#8b5cf6]" />
              <span className="text-xs font-semibold tracking-widest text-text-muted uppercase">Account</span>
            </div>

            <div className="flex items-center gap-3">
              <NeonButton variant="ghost" size="sm" onClick={() => { onClose(); navigate('/profile'); }}>
                Edit Profile
              </NeonButton>
              <button
                onClick={handleSignOut}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
