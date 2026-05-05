/**
 * @file App.tsx
 * @description Root component that wraps layouts.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans">
      <Outlet />
    </div>
  );
};

export default App;
