/**
 * @file ManaBar.tsx
 * @description Renders mana crystals.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface ManaBarProps {
  current: number;
  max: number;
}

export const ManaBar: React.FC<ManaBarProps> = ({ current, max }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: "back.out(2)" }
      );
    }
  }, [max]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-mono text-neon-purple uppercase tracking-widest">Mana ({current}/{max})</span>
      <div ref={containerRef} className="flex gap-2">
        {Array.from({ length: Math.min(10, max) }).map((_, i) => (
          <div 
            key={i} 
            className={`w-6 h-6 rotate-45 border-2 ${i < current ? 'bg-neon-purple border-neon-purple shadow-[0_0_8px_#8b5cf6]' : 'bg-transparent border-text-muted opacity-50'}`} 
            style={{ borderRadius: '4px' }}
          />
        ))}
      </div>
    </div>
  );
};
