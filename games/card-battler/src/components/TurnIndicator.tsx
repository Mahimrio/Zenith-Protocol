/**
 * @file TurnIndicator.tsx
 * @description Center-screen banner on turn change.
 */
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const TurnIndicator: React.FC<{ currentTurn: 'player' | 'enemy' }> = ({ currentTurn }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [turn, setTurn] = useState(currentTurn);

  useEffect(() => {
    if (currentTurn !== turn) {
      setTurn(currentTurn);
      setVisible(true);
    } else if (!visible && currentTurn === 'player' && turn === 'player') {
      // First turn mount trigger
      setVisible(true);
    }
  }, [currentTurn, turn]);

  useEffect(() => {
    if (visible && bannerRef.current) {
      const tl = gsap.timeline({ onComplete: () => setVisible(false) });
      tl.fromTo(bannerRef.current, { x: window.innerWidth, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" })
        .to(bannerRef.current, { scale: 1.05, duration: 1 })
        .to(bannerRef.current, { x: -window.innerWidth, opacity: 0, duration: 0.4, ease: "power2.in" });
    }
  }, [visible, turn]);

  if (!visible) return null;

  const isPlayer = turn === 'player';
  const color = isPlayer ? 'text-neon-cyan' : 'text-neon-amber';
  const shadow = isPlayer ? '#00f5ff' : '#f59e0b';

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div 
        ref={bannerRef}
        className="w-full bg-black/80 backdrop-blur-md border-y border-border-glass py-8 flex items-center justify-center"
      >
        <h2 className={`text-6xl font-black italic uppercase tracking-widest ${color}`} style={{ textShadow: `0 0 20px ${shadow}` }}>
          {isPlayer ? "Your Turn" : "Enemy Turn"}
        </h2>
      </div>
    </div>
  );
};
