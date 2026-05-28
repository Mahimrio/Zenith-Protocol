/**
 * @file NeonGrid.tsx
 * @description Full-viewport dynamic animated neon background with grid,
 * floating particles, and ambient light orbs.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const PARTICLE_COUNT = 30;
const ORB_COUNT = 3;

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
  kf25: { ty: number; tx: number };
  kf50: { ty: number; tx: number };
  kf75: { ty: number; tx: number };
}

interface Orb {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

/* ── Seeded PRNG for stable randomness across renders ────────────── */
function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(42);

const particles: Particle[] = [];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: rng() * 100,
    y: rng() * 100,
    size: 1.5 + rng() * 2.5,
    speed: 20 + rng() * 40,
    opacity: 0.15 + rng() * 0.35,
    delay: rng() * 5,
    kf25: { ty: 30 + rng() * 40, tx: 10 + rng() * 20 },
    kf50: { ty: 60 + rng() * 60, tx: -5 + rng() * 10 },
    kf75: { ty: 30 + rng() * 40, tx: -15 + rng() * 15 },
  });
}

const colors = ['rgba(0,245,255,0.06)', 'rgba(139,92,246,0.05)', 'rgba(245,158,11,0.04)'];
const orbs: Orb[] = [];
for (let i = 0; i < ORB_COUNT; i++) {
  orbs.push({
    x: 10 + rng() * 80,
    y: 10 + rng() * 80,
    size: 300 + rng() * 400,
    color: colors[i % colors.length],
    duration: 25 + rng() * 20,
  });
}

export const NeonGrid: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gsap.to(gridRef.current, {
        backgroundPosition: '0px 100px, 100px 0px',
        repeat: -1,
        duration: 20,
        ease: 'linear'
      });
    }
  }, []);

  return (
    <>
      <div
        ref={gridRef}
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,245,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,245,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: '0px 0px, 0px 0px'
        }}
      />
      {particles.map((p, i) => (
        <div
          key={`p-${i}`}
          className="fixed pointer-events-none -z-10 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(0, 245, 255, 0.6)',
            boxShadow: '0 0 4px rgba(0,245,255,0.4)',
            opacity: p.opacity,
          }}
        >
          <style>{`
            @keyframes float-${i} {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: ${p.opacity}; }
              25% { transform: translateY(-${p.kf25.ty}px) translateX(${p.kf25.tx}px); opacity: ${p.opacity + 0.1}; }
              50% { transform: translateY(-${p.kf50.ty}px) translateX(${p.kf50.tx}px); opacity: ${p.opacity}; }
              75% { transform: translateY(-${p.kf75.ty}px) translateX(${p.kf75.tx}px); opacity: ${p.opacity + 0.15}; }
            }
          `}</style>
          <div
            className="w-full h-full"
            style={{
              animation: `float-${i} ${p.speed}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        </div>
      ))}
      {orbs.map((o, i) => (
        <div
          key={`o-${i}`}
          className="fixed pointer-events-none -z-10 rounded-full blur-3xl"
          style={{
            left: `${o.x}%`,
            top: `${o.y}%`,
            width: o.size,
            height: o.size,
            background: o.color,
          }}
        />
      ))}
    </>
  );
};
