/**
 * @file ProtectedRoute.tsx
 * @description Route guard that ensures the user is authenticated before
 * rendering child routes. Handles three states:
 *
 * 1. Token exists but no user loaded → calls `fetchMe()` and shows
 *    `GlobalLoadingScreen` while the request is in-flight.
 * 2. Not authenticated after check → redirects to `/login`.
 * 3. Authenticated → renders `<Outlet />`.
 *
 * Supports an optional `requireAdmin` prop for future admin-only routes.
 */
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { GlobalLoadingScreen } from './GlobalLoadingScreen';

interface ProtectedRouteProps {
  /** If true, requires `user.is_admin` — redirects to `/` otherwise. */
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAdmin = false,
}) => {
  const { user, token, fetchMe } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Token exists (e.g. from localStorage) but user hasn't been hydrated yet
    if (token && !user) {
      setIsVerifying(true);
      fetchMe().finally(() => setIsVerifying(false));
    }
  }, [token, user, fetchMe]);

  /* ── Still resolving the user from the token ──────────────── */
  if (isVerifying) {
    return <GlobalLoadingScreen />;
  }

  /* ── No valid session ─────────────────────────────────────── */
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  /* ── Admin gate (future-proof) ────────────────────────────── */
  if (requireAdmin && !(user as unknown as Record<string, unknown>)['is_admin']) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
