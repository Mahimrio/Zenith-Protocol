/**
 * @file Navbar.tsx
 * @description Main layout navbar with animated entrance, score display,
 * settings gear icon, and quick mute toggle with GSAP wiggle.
 */
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { ScoreDisplay } from '@ui/ScoreDisplay';
import { NeonButton } from '@ui/NeonButton';
import { gameBus } from '@sdk/eventBus';
import { useSoundStore } from '@sdk/store/soundStore';
import { useNavigate } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';

export const Navbar: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const speakerRef = useRef<HTMLButtonElement>(null);
  const { activeGame, registeredGames } = useGameStore();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { isMuted, toggleMute } = useSoundStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const game = registeredGames.find(g => g.id === activeGame);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -60, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (breadcrumbRef.current && game) {
      gsap.fromTo(breadcrumbRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [game]);

  const handlePauseRequest = () => {
    gameBus.emit('PAUSE_REQUESTED');
  };

  /** GSAP wiggle animation on speaker icon when toggling mute. */
  const handleMuteToggle = () => {
    toggleMute();
    if (speakerRef.current) {
      gsap.fromTo(speakerRef.current,
        { rotation: 0 },
        { rotation: 15, duration: 0.08, yoyo: true, repeat: 5, ease: 'power1.inOut',
          onComplete: () => { gsap.set(speakerRef.current, { rotation: 0 }); },
        },
      );
    }
  };

  return (
    <>
      <header ref={navRef} className="h-16 border-b border-border-glass bg-bg-secondary/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-neon-cyan shadow-[0_0_8px_#00f5ff80]" />
            <h1 className="text-xl font-bold text-text-primary tracking-widest">
              GAME<span className="text-neon-cyan">HUB</span>
            </h1>
          </div>
          
          <div className="h-6 w-px bg-border-glass" />
          
          <div className="flex items-center text-sm font-medium text-text-muted">
            <span>Menu</span>
            {game && (
              <div ref={breadcrumbRef} className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-neon-purple shadow-[0_0_4px_#8b5cf640] uppercase tracking-wider">{game.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeGame && (
            <button 
              onClick={handlePauseRequest}
              className="text-text-muted hover:text-neon-cyan transition-colors focus:outline-none flex items-center justify-center p-2 rounded-lg hover:bg-glass"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}

          <div className="bg-glass px-4 py-1.5 rounded-lg border border-border-glass shadow-inner">
            <ScoreDisplay score={user?.total_score || 0} className="!text-sm" />
          </div>

          {/* ── Sound controls ───────────────────────────── */}
          <button
            ref={speakerRef}
            onClick={handleMuteToggle}
            className={`p-2 rounded-lg transition-colors focus:outline-none ${
              isMuted
                ? 'text-red-400 bg-red-400/10'
                : 'text-text-muted hover:text-neon-cyan hover:bg-glass'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="text-text-muted hover:text-neon-cyan transition-colors focus:outline-none p-2 rounded-lg hover:bg-glass"
            aria-label="Open settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {isAuthenticated ? (
            <div className="w-8 h-8 rounded-full bg-glass border border-neon-cyan flex items-center justify-center overflow-hidden shadow-[0_0_8px_#00f5ff40]">
               <span className="text-xs text-neon-cyan font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          ) : (
            <NeonButton variant="ghost" size="sm" onClick={() => navigate('/login')}>
              LOGIN
            </NeonButton>
          )}
        </div>
      </header>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};
