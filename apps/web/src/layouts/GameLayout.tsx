/* eslint-disable react-hooks/static-components */
/**
 * @file GameLayout.tsx
 * @description Full-screen layout for active game without navigation.
 * Shows orientation warning on mobile portrait for dojo-3d.
 */
import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGameStore } from '../store/gameStore';
import { launchGamePlugin } from '../lib/pluginLoader';
import { GlobalLoadingScreen } from '../components/GlobalLoadingScreen';
import { GlassCard } from '@ui/GlassCard';
import { useIsMobile } from '@sdk/utils/device';

export const GameLayout: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { launchGame, closeGame } = useGameStore();
  const isMobile = useIsMobile();
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (gameId) {
      launchGame(gameId);
    }
    return () => {
      closeGame();
    };
  }, [gameId, launchGame, closeGame]);

  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  if (!gameId) {
    navigate('/');
    return null;
  }

  const GameComponent = gameId ? launchGamePlugin(gameId) : null;

  if (!GameComponent) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-bg-primary text-red-500 font-mono tracking-widest">
        CRITICAL ERROR: MODULE NOT FOUND
      </div>
    );
  }

  const showOrientationWarning = isMobile && gameId === 'dojo-3d' && isPortrait;

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <Suspense fallback={<GlobalLoadingScreen />}>
        <GameComponent />
      </Suspense>

      {showOrientationWarning && <OrientationOverlay />}
    </div>
  );
};

/**
 * Glassmorphism overlay prompting user to rotate device.
 */
const OrientationOverlay: React.FC = () => {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const iconRef = React.useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (overlayRef.current) {
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: 90,
        duration: 1,
        repeat: -1,
        ease: 'power1.inOut',
        yoyo: true,
      });
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
    >
      <GlassCard className="p-8 flex flex-col items-center gap-4 max-w-xs text-center" glowColor="neon-cyan">
        <svg
          ref={iconRef}
          className="w-12 h-12 text-neon-cyan"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a2 2 0 00-2-2h-4a2 2 0 00-2 2" />
        </svg>
        <h3 className="text-lg font-bold text-text-primary tracking-widest uppercase">
          Rotate Your Device
        </h3>
        <p className="text-sm text-text-muted">
          Rotate to landscape for the best Dojo 3D experience.
        </p>
      </GlassCard>
    </div>
  );
};
