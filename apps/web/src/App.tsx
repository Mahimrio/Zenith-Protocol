/**
 * @file App.tsx
 * @description Root component that wraps layouts.
 * Mounts AchievementToast and OfflineBanner globally (outside all routes) and
 * initializes the achievements hook for real-time unlock listening.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AchievementToast } from './components/AchievementToast';
import { OfflineBanner } from './components/OfflineBanner';
import { useAchievements } from './hooks/useAchievements';

export const App: React.FC = () => {
  useAchievements();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans">
      <OfflineBanner />
      <AchievementToast />
      <Outlet />
    </div>
  );
};

export default App;
