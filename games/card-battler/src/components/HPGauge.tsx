/**
 * @file HPGauge.tsx
 * @description HP bar with smooth GSAP tween, shake on damage, low-HP pulse warning.
 */
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export interface HPGaugeProps {
  current: number;
  max: number;
  color: string;
  label: string;
  align?: 'left' | 'right';
  className?: string;
}

export const HPGauge: React.FC<HPGaugeProps> = ({
  current,
  max,
  color,
  label,
  align = 'left',
  className = '',
}) => {
  const fillRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const damageNumberRef = useRef<HTMLSpanElement>(null);
  const [prevHp, setPrevHp] = useState(current);
  const [flashKey, setFlashKey] = useState(0);
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = percentage < 30;
  const isCritical = percentage < 15;

  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        width: `${percentage}%`,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [percentage]);

  // Damage shake + flash + floating damage number
  useEffect(() => {
    if (current < prevHp && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          containerRef.current,
          { x: 0 },
          { x: 8, duration: 0.06, ease: 'power2.out', yoyo: true, repeat: 5 }
        );
        setFlashKey((k) => k + 1);
        if (damageNumberRef.current) {
          const dmg = prevHp - current;
          damageNumberRef.current.textContent = `-${dmg}`;
          gsap.fromTo(
            damageNumberRef.current,
            { y: 0, opacity: 1, scale: 0.6 },
            { y: -40, opacity: 0, scale: 1.4, duration: 0.9, ease: 'power2.out' }
          );
        }
      }, containerRef);
      return () => ctx.revert();
    }
    setPrevHp(current);
  }, [current, prevHp]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1 ${align === 'right' ? 'items-end' : 'items-start'} ${className}`}
    >
      {label && (
        <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest ${isCritical ? 'text-red-400' : 'text-text-muted'}`}>
          <span>{label}</span>
          <span className={`font-bold ${isLow ? 'text-red-400' : 'text-text-primary'}`}>
            {current} / {max}
          </span>
        </div>
      )}
      <div
        key={flashKey}
        className="h-3 w-48 sm:w-56 bg-glass backdrop-blur-md border border-border-glass rounded-full overflow-hidden relative"
        style={{ boxShadow: `inset 0 0 6px rgba(0,0,0,0.5)` }}
      >
        <div
          ref={fillRef}
          className={`absolute top-0 left-0 h-full rounded-full ${isCritical ? 'animate-pulse' : ''}`}
          style={{
            backgroundColor: color,
            backgroundImage: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 8px ${color}, 0 0 14px ${color}80`,
            width: '100%',
          }}
        />
        {/* Red flash overlay on damage */}
        <div
          className="absolute inset-0 bg-red-500/40 pointer-events-none rounded-full"
          style={{ animation: flashKey > 0 ? 'hp-flash 0.3s ease-out forwards' : 'none' }}
        />
      </div>
      <span
        ref={damageNumberRef}
        className="absolute -top-2 right-0 text-red-400 font-black text-lg pointer-events-none opacity-0"
        style={{ textShadow: '0 0 8px rgba(239,68,68,0.8)' }}
      />
      <style>{`
        @keyframes hp-flash {
          0% { opacity: 0.7; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
