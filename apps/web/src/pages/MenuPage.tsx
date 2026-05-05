/**
 * @file MenuPage.tsx
 * @description Main menu page with animated title and game grid.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { NeonGrid } from '../components/NeonGrid';
import { GameGrid } from '../components/GameGrid';
import { NeonButton } from '@ui/NeonButton';

export const MenuPage: React.FC = () => {
  const { registeredGames } = useGameStore();
  const { user, logout } = useAuth();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      const letters = titleRef.current.children;
      gsap.fromTo(
        letters,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out'
        }
      );
    }
  }, []);

  const titleText = "GAME HUB".split('');

  return (
    <div className="relative min-h-screen flex flex-col items-center z-10 w-full pt-10 pb-20">
      <NeonGrid />
      <div className="flex-1 w-full max-w-6xl px-6 flex flex-col items-center">
        <div className="text-center mb-12 mt-8">
          <h1 ref={titleRef} className="text-6xl font-bold text-neon-cyan mb-4 tracking-widest" style={{ textShadow: '0 0 12px #00f5ff80' }}>
            {titleText.map((char, index) => (
              <span key={index} className="inline-block">{char === ' ' ? '\u00A0' : char}</span>
            ))}
          </h1>
          <p className="text-neon-purple italic text-xl font-medium" style={{ textShadow: '0 0 8px #8b5cf680' }}>
            Choose your arena
          </p>
        </div>

        <GameGrid games={registeredGames} />
      </div>

      <footer className="fixed bottom-0 w-full h-16 bg-bg-secondary/80 backdrop-blur-md border-t border-border-glass flex items-center justify-between px-8 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-glass border border-neon-cyan overflow-hidden flex items-center justify-center shadow-[0_0_8px_#00f5ff40]">
            <span className="text-neon-cyan font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-text-primary">{user?.name || 'Guest User'}</span>
            <span className="text-xs text-text-muted font-mono">Total Score: 12,450</span>
          </div>
        </div>
        <NeonButton variant="ghost" size="sm" onClick={logout}>
          LOGOUT
        </NeonButton>
      </footer>
    </div>
  );
};
