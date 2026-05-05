/**
 * @file GameCard.tsx
 * @description Individual game card with hover responses.
 */
import React, { useRef } from 'react';
import gsap from 'gsap';
import { GameManifest } from '@sdk/types';
import { GlassCard } from '@ui/GlassCard';
import { NeonButton } from '@ui/NeonButton';

export interface GameCardProps {
  manifest: GameManifest;
  onLaunch: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ manifest, onLaunch }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { scale: 1.04, duration: 0.3, ease: 'power2.out' });
      gsap.to(cardRef.current, { boxShadow: '0 0 15px #00f5ff80, 0 0 30px #00f5ff40', duration: 0.3 });
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(cardRef.current, { boxShadow: '0 0 8px #00f5ff40, 0 0 24px #00f5ff20', duration: 0.3 });
    }
  };

  const handleClick = () => {
    if (cardRef.current) {
      const tl = gsap.timeline();
      tl.to(cardRef.current, { scale: 0.96, duration: 0.1, ease: 'power2.out' })
        .to(cardRef.current, { scale: 1.04, duration: 0.1, ease: 'power2.out' })
        .call(onLaunch);
    } else {
      onLaunch();
    }
  };

  return (
    <div 
      ref={cardRef} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className="block w-full h-full"
      style={{ boxShadow: '0 0 8px #00f5ff40, 0 0 24px #00f5ff20', borderRadius: '0.75rem' }}
    >
      <GlassCard className="flex flex-col h-full overflow-hidden border-border-glass">
        <div className="h-48 w-full bg-gradient-to-br from-bg-secondary to-black relative">
          {manifest.thumbnail ? (
            <img src={manifest.thumbnail} alt={manifest.name} className="w-full h-full object-cover opacity-80 mix-blend-screen" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-text-muted font-mono tracking-widest uppercase">No Visual</div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-2xl font-bold text-text-primary mb-2">{manifest.name}</h3>
          <p className="text-sm text-text-muted flex-1 mb-6 leading-relaxed">{manifest.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {manifest.tags.map(tag => (
              <span key={tag} className="px-3 py-1 text-xs font-mono rounded-full bg-bg-primary border border-neon-purple text-neon-purple shadow-[0_0_4px_#8b5cf640]">
                {tag}
              </span>
            ))}
          </div>

          <NeonButton variant="primary" onClick={handleClick} className="w-full uppercase font-bold tracking-widest text-sm">
            Deploy
          </NeonButton>
        </div>
      </GlassCard>
    </div>
  );
};
