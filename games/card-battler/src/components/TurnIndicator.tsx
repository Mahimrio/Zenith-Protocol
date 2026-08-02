/**
 * @file TurnIndicator.tsx
 * @description Full-width banner that slides in from right and out to left on turn change.
 */
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const TurnIndicator: React.FC<{ currentTurn: 'player' | 'enemy' }> = ({ currentTurn }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [turn, setTurn] = useState(currentTurn);
  const lastTurn = useRef(currentTurn);

  // Show on first mount + on every change
  useEffect(() => {
    if (currentTurn !== lastTurn.current) {
      setTurn(currentTurn);
      setVisible(true);
      lastTurn.current = currentTurn;
    } else if (!visible && currentTurn === 'player' && turn === 'player') {
      setVisible(true);
    }
  }, [currentTurn, turn, visible]);

  // Animate in → hold → out
  useEffect(() => {
    if (visible && bannerRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ onComplete: () => setVisible(false) });
        tl.fromTo(
          bannerRef.current,
          { x: '110%', opacity: 0 },
          { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
        )
          .to(bannerRef.current, { scale: 1.04, duration: 0.8, ease: 'sine.inOut' })
          .to(bannerRef.current, {
            x: '-110%',
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
          });
      }, bannerRef);
      return () => ctx.revert();
    }
  }, [visible, turn]);

  if (!visible) return null;

  const isPlayer = turn === 'player';
  const color = isPlayer ? 'text-neon-cyan' : 'text-neon-amber';
  const shadow = isPlayer ? '#00f5ff' : '#f59e0b';
  const borderColor = isPlayer ? 'border-neon-cyan' : 'border-neon-amber';
  const bgColor = isPlayer ? 'bg-neon-cyan/10' : 'bg-neon-amber/10';

  return (
    <div className="fixed inset-x-0 top-1/3 pointer-events-none flex items-center justify-center z-50">
      <div
        ref={bannerRef}
        className={`px-12 py-5 ${bgColor} backdrop-blur-xl border-y-2 ${borderColor} shadow-[0_0_40px_${shadow}] flex items-center justify-center gap-4`}
        style={{
          boxShadow: `0 0 40px ${shadow}, 0 0 80px ${shadow}40`,
        }}
      >
        <span
          className={`text-5xl sm:text-6xl font-black italic uppercase tracking-widest ${color}`}
          style={{ textShadow: `0 0 20px ${shadow}, 0 0 40px ${shadow}80` }}
        >
          {isPlayer ? '⚡ Your Turn' : '🔥 Enemy Turn'}
        </span>
      </div>
    </div>
  );
};
