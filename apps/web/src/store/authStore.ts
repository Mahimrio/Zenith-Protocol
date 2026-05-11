/**
 * @file authStore.ts
 * @description Zustand store for user authentication state.
 */
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  total_score: number;
  games_played: number;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  updateUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));
