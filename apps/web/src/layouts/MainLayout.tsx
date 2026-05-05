/**
 * @file MainLayout.tsx
 * @description Persistent shell with Navbar and routing outlet.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen relative w-full">
      <Navbar />
      <main className="flex-1 flex flex-col w-full relative z-0">
        <Outlet />
      </main>
    </div>
  );
};
