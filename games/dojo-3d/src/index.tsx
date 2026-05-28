/**
 * @file index.tsx
 * @description Main entry point for the 3D Dojo plugin module.
 */
import React, { useEffect, useRef } from 'react';
import { DojoCanvas } from './components/DojoCanvas';
import { HUD } from './components/HUD';
import { useDojoStore } from './store/dojoStore';
import { useGameBridge } from '@sdk/useGameBridge';
import { GameStatus } from '@sdk/types';

const Dojo3DModule: React.FC = () => {
  const {
    gameStatus, startGame, score, wave,
    enemiesKilled, maxCombo
  } = useDojoStore();
  const { emitGameOver, requestPause } = useGameBridge('dojo-3d');
  const gameStartTime = useRef<number>(Date.now());

  useEffect(() => {
    startGame();
    gameStartTime.current = Date.now();
  }, [startGame]);

  useEffect(() => {
    if (gameStatus === GameStatus.GAME_OVER) {
      emitGameOver({
        score,
        metadata: {
          survivedMs: Date.now() - gameStartTime.current,
          wave,
          enemiesKilled,
          maxCombo,
        },
        completedAt: new Date().toISOString()
      });
    }
  }, [gameStatus, score, wave, enemiesKilled, maxCombo, emitGameOver]);

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
