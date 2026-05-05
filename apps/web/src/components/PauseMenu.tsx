/**
 * @file PauseMenu.tsx
 * @description Pause menu overlay triggered via eventBus.
 */
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { gameBus } from '@sdk/eventBus';
import { GlassCard } from '@ui/GlassCard';
import { NeonButton } from '@ui/NeonButton';

export interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart, onMenu }) => {
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePause = () => setIsVisible(true);
    const handleResume = () => setIsVisible(false);

    gameBus.on('PAUSE_REQUESTED', handlePause);
    gameBus.on('RESUME_REQUESTED', handleResume);

    return () => {
      gameBus.off('PAUSE_REQUESTED', handlePause);
      gameBus.off('RESUME_REQUESTED', handleResume);
    };
  }, []);

  useEffect(() => {
    if (isVisible && overlayRef.current) {
      gsap.fromTo(overlayRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleLocalResume = () => {
    gameBus.emit('RESUME_REQUESTED');
    onResume();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-md p-4">
      <div ref={overlayRef} className="w-full max-w-sm">
        <GlassCard glowColor="neon-purple" className="w-full p-8 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-neon-purple mb-8 uppercase tracking-widest" style={{ textShadow: '0 0 8px #8b5cf680' }}>
            System Paused
          </h2>
          
          <div className="w-full flex flex-col gap-4">
            <NeonButton variant="primary" className="w-full tracking-wider" onClick={handleLocalResume}>
              RESUME
            </NeonButton>
            <NeonButton variant="ghost" className="w-full tracking-wider" onClick={onRestart}>
              RESTART
            </NeonButton>
            <div className="w-full h-px bg-border-glass my-2" />
            <NeonButton variant="danger" className="w-full tracking-wider" onClick={onMenu}>
              ABORT TO MENU
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
