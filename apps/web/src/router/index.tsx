/**
 * @file index.tsx
 * @description React Router setup with lazy loading for game modules.
 */
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { App } from '../App';
import { MainLayout } from '../layouts/MainLayout';
import { GameLayout } from '../layouts/GameLayout';
import { MenuPage } from '../pages/MenuPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <MenuPage />
          }
        ]
      },
      {
        path: 'play/:gameId',
        element: <GameLayout />,
      }
    ]
  }
]);
