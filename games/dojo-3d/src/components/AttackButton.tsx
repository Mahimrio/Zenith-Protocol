/**
 * @file AttackButton.tsx
 * @description Circular attack button for mobile Dojo 3D.
 *
 * Bottom-right corner. 80px circular. GSAP scale 1→1.2→1 on press.
 */
import React, { useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { useIsMobile } from '@sdk/utils/device';

export interface AttackButtonProps {
  onAttack: () => void;
}

const BUTTON_SIZE = 80;

/**
 * Mobile attack button with GSAP press animation.
 */
export const AttackButton: React.FC<AttackButtonProps> = ({ onAttack }) => {
  const isMobile = useIsMobile();
  const btnRef = useRef<HTMLDivElement>(null);
  const cooldown = useRef(false);
  const cooldownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimeout.current) clearTimeout(cooldownTimeout.current);
      if (btnRef.current) gsap.killTweensOf(btnRef.current);
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (cooldown.current) return;

    cooldown.current = true;
    onAttack();

    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 1.2,
        duration: 0.1,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.set(btnRef.current, { scale: 1 });
        },
      });
    }

    if (cooldownTimeout.current) clearTimeout(cooldownTimeout.current);
    cooldownTimeout.current = setTimeout(() => { cooldown.current = false; }, 500);
  }, [onAttack]);

  if (!isMobile) return null;

  return (
    <div
      className="absolute bottom-8 right-8 z-30 select-none touch-none"
      style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
    >
      <div
        ref={btnRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'rgba(248, 113, 113, 0.2)',
          border: '2px solid #f87171',
          boxShadow: '0 0 12px #f8717160',
          backdropFilter: 'blur(4px)',
        }}
      >
        <svg className="w-8 h-8 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>
  );
};
