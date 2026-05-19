/**
 * @file TouchControls.tsx
 * @description Fullscreen invisible touch overlay for Cyber Runner mobile.
 *
 * Left half: jump. Right half: slide.
 * Visual zone hints fade out after 2s on first 3 plays.
 * preventDefault on all touch events to stop page scroll.
 */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useIsMobile } from '@sdk/utils/device';

export interface TouchControlsProps {
  onJump: () => void;
  onSlide: () => void;
}

/**
 * Invisible touch overlay for mobile runner controls.
 */
export const TouchControls: React.FC<TouchControlsProps> = ({ onJump, onSlide }) => {
  const isMobile = useIsMobile();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const playCount = useRef(0);
  const [showHints, setShowHints] = useState(true);

  const handleLeftTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onJump();
    incrementPlayCount();
  }, [onJump]);

  const handleRightTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onSlide();
    incrementPlayCount();
  }, [onSlide]);

  const incrementPlayCount = useCallback(() => {
    playCount.current += 1;
    if (playCount.current >= 3) {
      setShowHints(false);
      if (leftRef.current) {
        gsap.to(leftRef.current, { opacity: 0, duration: 0.5 });
      }
      if (rightRef.current) {
        gsap.to(rightRef.current, { opacity: 0, duration: 0.5 });
      }
    }
  }, []);

  useEffect(() => {
    if (!showHints || !leftRef.current || !rightRef.current) return;
    const timer = setTimeout(() => {
      gsap.to([leftRef.current, rightRef.current], {
        opacity: 0,
        duration: 1,
        stagger: 0.2,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [showHints]);

  if (!isMobile) return null;

  return (
    <div className="absolute inset-0 z-10 flex select-none touch-none">
      {/* Left half — Jump */}
      <div
        ref={leftRef}
        className="flex-1 flex items-center justify-center opacity-60"
        onTouchStart={handleLeftTouch}
        onTouchMove={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <svg className="w-10 h-10 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-xs text-neon-cyan font-mono tracking-widest">JUMP</span>
        </div>
      </div>

      {/* Right half — Slide */}
      <div
        ref={rightRef}
        className="flex-1 flex items-center justify-center opacity-60"
        onTouchStart={handleRightTouch}
        onTouchMove={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <svg className="w-10 h-10 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs text-neon-purple font-mono tracking-widest">SLIDE</span>
        </div>
      </div>
    </div>
  );
};
