/**
 * @file NeonGrid.tsx
 * @description Full-viewport animated neon grid background.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

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
  );
};
