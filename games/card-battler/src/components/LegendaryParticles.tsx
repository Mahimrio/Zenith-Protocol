/**
 * @file LegendaryParticles.tsx
 * @description Canvas-based floating gold sparks overlay for Legendary cards.
 * Uses a single absolutely-positioned <canvas> with rAF to animate 18 particles.
 * Particles spawn at the bottom and drift upward, fading out near the top.
 */
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
}

export const LegendaryParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const spawnParticle = (): Particle => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      return {
        x: Math.random() * w,
        y: h + 4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.4 + Math.random() * 0.8),
        radius: 0.6 + Math.random() * 1.6,
        life: 0,
        maxLife: 80 + Math.random() * 80,
      };
    };

    // Seed initial particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 12; i++) {
        const p = spawnParticle();
        p.life = Math.random() * p.maxLife;
        particlesRef.current.push(p);
      }
    }

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      // Maintain ~18 particles
      while (particles.length < 18) {
        particles.push(spawnParticle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio >= 1 || p.y < -10) {
          particles.splice(i, 1);
          continue;
        }

        // Fade in fast, hold, fade out
        const alpha = lifeRatio < 0.15
          ? lifeRatio / 0.15
          : lifeRatio > 0.7
            ? 1 - (lifeRatio - 0.7) / 0.3
            : 1;

        // Draw glowing gold dot
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `rgba(255, 220, 120, ${alpha * 0.95})`);
        gradient.addColorStop(0.4, `rgba(245, 158, 11, ${alpha * 0.55})`);
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};
