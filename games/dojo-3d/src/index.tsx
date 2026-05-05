/**
 * @file index.tsx
 * @description Main entry point for the 3D Dojo plugin module.
 */
import React, { useEffect } from 'react';
import { DojoCanvas } from './components/DojoCanvas';
import { HUD } from './components/HUD';
import { useDojoStore } from './store/dojoStore';
import { useGameBridge } from '@sdk/useGameBridge';

const Dojo3DModule: React.FC = () => {
  const { gameStatus, startGame, score, wave, survivedMs } = useDojoStore();
  const { emitGameOver, requestPause } = useGameBridge('dojo-3d');

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (gameStatus === 'GAME_OVER') {
      emitGameOver({
        score,
        metadata: {
          wave,
          survivedMs,
          enemiesKilled: Math.floor(score / 150)
        },
        completedAt: new Date().toISOString()
      });
    }
  }, [gameStatus, score, wave, survivedMs, emitGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && gameStatus === 'PLAYING') {
        requestPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, requestPause]);

  return (
    <div className="w-full h-full relative bg-black">
      <HUD />
      <DojoCanvas />
    </div>
  );
};

export default Dojo3DModule;
