/**
 * @file useAuth.ts
 * @description Hook wrapping authStore with common auth logic.
 */
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, login, logout } = useAuthStore();
  const isAuthenticated = !!token;

  return { user, token, isAuthenticated, login, logout };
};
