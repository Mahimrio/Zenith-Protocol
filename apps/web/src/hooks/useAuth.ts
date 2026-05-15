/**
 * @file useAuth.ts
 * @description Hook wrapping authStore with common auth logic.
 * Provides a clean API for components that need auth state.
 */
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    error,
    login,
    logout,
    register,
    fetchMe,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    error,
    login,
    logout,
    register,
    fetchMe,
  };
};
