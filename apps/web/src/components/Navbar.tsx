/**
 * @file Navbar.tsx
 * @description Main layout navbar with animated entrance.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { ScoreDisplay } from '@ui/ScoreDisplay';
import { NeonButton } from '@ui/NeonButton';
import { gameBus } from '@sdk/eventBus';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const { activeGame, registeredGames } = useGameStore();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  return (
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

      <div className="flex items-center gap-4">
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
  );
};
