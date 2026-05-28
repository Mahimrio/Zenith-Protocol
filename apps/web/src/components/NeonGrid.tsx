/**
 * @file NeonGrid.tsx
 * @description Full-viewport dynamic animated neon background with grid,
 * floating particles, and ambient light orbs.
 */
import React, { useEffect, useRef, useMemo } from 'react';
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
}

interface Orb {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
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

  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.5 + Math.random() * 2.5,
        speed: 20 + Math.random() * 40,
        opacity: 0.15 + Math.random() * 0.35,
        delay: Math.random() * 5,
      });
    }
    return arr;
  }, []);

  const orbs = useMemo<Orb[]>(() => {
    const colors = ['rgba(0,245,255,0.06)', 'rgba(139,92,246,0.05)', 'rgba(245,158,11,0.04)'];
    const arr: Orb[] = [];
    for (let i = 0; i < ORB_COUNT; i++) {
      arr.push({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 300 + Math.random() * 400,
        color: colors[i % colors.length],
        duration: 25 + Math.random() * 20,
      });
    }
    return arr;
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
              25% { transform: translateY(-${30 + Math.random() * 40}px) translateX(${10 + Math.random() * 20}px); opacity: ${p.opacity + 0.1}; }
              50% { transform: translateY(-${60 + Math.random() * 60}px) translateX(${-5 + Math.random() * 10}px); opacity: ${p.opacity}; }
              75% { transform: translateY(-${30 + Math.random() * 40}px) translateX(${-15 + Math.random() * 15}px); opacity: ${p.opacity + 0.15}; }
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
