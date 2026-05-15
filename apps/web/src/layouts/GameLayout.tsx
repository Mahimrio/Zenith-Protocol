/* eslint-disable react-hooks/static-components */
/**
 * @file GameLayout.tsx
 * @description Full-screen layout for active game without navigation.
 */
import React, { useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { launchGamePlugin } from '../lib/pluginLoader';
import { GlobalLoadingScreen } from '../components/GlobalLoadingScreen';

export const GameLayout: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { launchGame, closeGame } = useGameStore();

  useEffect(() => {
    if (gameId) {
      launchGame(gameId);
    }
    return () => {
      closeGame();
    };
  }, [gameId, launchGame, closeGame]);

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

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <Suspense fallback={<GlobalLoadingScreen />}>
        <GameComponent />
      </Suspense>
    </div>
  );
};
