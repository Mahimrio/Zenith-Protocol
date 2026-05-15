/* eslint-disable react-refresh/only-export-components */
/**
 * @file index.tsx
 * @description React Router setup with lazy loading for game modules.
 *
 * Route structure:
 *  - `/`          → MenuPage (public — users can browse games)
 *  - `/login`     → LoginPage (public)
 *  - `/register`  → RegisterPage (public)
 *  - `/play/:id`  → GameLayout (protected — requires auth)
 *  - `/profile`   → ProfilePage (protected — future)
 */
import { createBrowserRouter } from 'react-router-dom';
import { App } from '../App';
import { MainLayout } from '../layouts/MainLayout';
import { GameLayout } from '../layouts/GameLayout';
import { MenuPage } from '../pages/MenuPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { lazy } from 'react';
import { RouteErrorScreen } from '../components/RouteErrorScreen';

const ProfilePage = lazy(() => import('../pages/ProfilePage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorScreen />,
    children: [
      /* ── Public routes ─────────────────────────────────────── */
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <MenuPage />,
          },
        ],
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },

      /* ── Protected routes (require authentication) ─────────── */
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'play/:gameId',
            element: <GameLayout />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
]);
