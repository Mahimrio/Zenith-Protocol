/**
 * @file GameGrid.tsx
 * @description Responsive grid of GameCard components with GSAP scroll animation.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { GameManifest } from '@sdk/types';
import { GameCard } from './GameCard';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export interface GameGridProps {
  games: GameManifest[];
}

export const GameGrid: React.FC<GameGridProps> = ({ games }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
          }
        }
      );
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [games]);

  const handleLaunch = (gameId: string) => {
    navigate(`/play/${gameId}`);
  };

  return (
    <div ref={gridRef} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
      {games.length === 0 ? (
        <div className="col-span-full text-center text-text-muted mt-10 p-10 bg-glass border border-border-glass rounded-xl backdrop-blur-md">
          <p className="text-lg">No modules loaded yet.</p>
        </div>
      ) : (
        games.map((game) => (
          <GameCard key={game.id} manifest={game} onLaunch={() => handleLaunch(game.id)} />
        ))
      )}
    </div>
  );
};
