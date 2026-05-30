/**
 * @file GlobalLoadingScreen.tsx
 * @description Fallback component for React.Suspense with animated SVG ring.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const GlobalLoadingScreen: React.FC<{ gameName?: string }> = ({ gameName }) => {
  const ringRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      });
      gsap.to(ringRef.current, {
        rotation: 360,
        duration: 4,
        ease: 'linear',
        repeat: -1,
        transformOrigin: '50% 50%'
      });
    }

    if (textRef.current) {
      gsap.to(textRef.current, {
        opacity: 0.3,
        duration: 1,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-[100]">
      <svg className="w-24 h-24 mb-6" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle 
          ref={ringRef}
          cx="50" cy="50" r="40" 
          fill="none" 
          stroke="#00f5ff" 
          strokeWidth="4" 
          strokeDasharray="251" 
          strokeDashoffset="251"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px #00f5ff)' }}
        />
      </svg>
      <div ref={textRef} className="text-neon-cyan font-mono tracking-widest text-sm uppercase">
        Loading module...
      </div>
      {gameName && (
        <p className="text-text-muted text-sm mt-4 font-mono tracking-widest uppercase animate-pulse">
          Loading {gameName}...
        </p>
      )}
    </div>
  );
};
