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
import { LoginPage } from '../pages/LoginPage';
import { RouteErrorScreen } from '../components/RouteErrorScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorScreen />,
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
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'play/:gameId',
        element: <GameLayout />,
      }
    ]
  }
]);
