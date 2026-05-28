/**
 * @file index.tsx
 * @description Main entry point for Cyber Runner module.
 */
import React, { useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { RunnerHUD } from './components/RunnerHUD';
import { useRunnerStore } from './store/runnerStore';
import { useGameBridge } from '@sdk/useGameBridge';
import { GameStatus } from '@sdk/types';

const CyberRunnerGame: React.FC = () => {
  const { startGame, gameStatus, distance, obstaclesAvoided, speedLevel } = useRunnerStore();
  const { emitGameOver, requestPause } = useGameBridge('cyber-runner');

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (gameStatus === GameStatus.GAME_OVER) {
      emitGameOver({
        score: Math.floor(distance / 100),
        metadata: {
          distanceTraveled: Math.floor(distance),
          finalSpeedLevel: speedLevel,
          obstaclesAvoided,
        },
        completedAt: new Date().toISOString()
      });
    }
  }, [gameStatus, distance, speedLevel, obstaclesAvoided, emitGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && gameStatus === GameStatus.PLAYING) {
        requestPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, requestPause]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      <RunnerHUD speedLevel={speedLevel} />
      <GameCanvas />
    </div>
  );
};

export default CyberRunnerGame;
