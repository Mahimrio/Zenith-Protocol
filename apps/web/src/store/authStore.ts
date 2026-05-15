/**
 * @file authStore.ts
 * @description Zustand store for user authentication state.
 * Manages login, registration, token persistence, and user hydration.
 */
import { create } from 'zustand';
import api from '../lib/axios';

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
  isAuthenticated: boolean;
  error: string | null;

  /** Store user + token after successful login response. */
  login: (user: User, token: string) => void;
  /** Replace the user object (e.g. after score update). */
  updateUser: (user: User) => void;
  /** Clear all auth state and remove persisted token. */
  logout: () => void;

  /**
   * Register a new account via POST /auth/register.
   * On success: persists token and sets user + isAuthenticated.
   * On error: sets `error` and re-throws for component-level handling.
   */
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;

  /**
   * Hydrate user from the API using the persisted token.
   * Called by ProtectedRoute when token exists but user is null
   * (e.g. after a page refresh).
   */
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  error: null,

  /* ── Login (called after successful API response) ──────────── */
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, error: null });
  },

  /* ── Update user in-place ──────────────────────────────────── */
  updateUser: (user) => set({ user }),

  /* ── Logout ────────────────────────────────────────────────── */
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  /* ── Register ──────────────────────────────────────────────── */
  register: async (name, email, password, passwordConfirmation) => {
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        error: null,
      });
    } catch (err: unknown) {
      // Extract the most useful error message from Laravel's validation response
      let message = 'Registration failed';
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const response = (err as { response: { data: { message?: string; errors?: Record<string, string[]> } } }).response;
        if (response?.data?.errors) {
          // Grab the first validation error
          const firstField = Object.values(response.data.errors)[0];
          message = firstField?.[0] ?? message;
        } else if (response?.data?.message) {
          message = response.data.message;
        }
      }
      set({ error: message });
      throw new Error(message);
    }
  },

  /* ── Fetch current user (hydrate from token) ───────────────── */
  fetchMe: async () => {
    try {
      const { data } = await api.get('/user');
      set({ user: data, isAuthenticated: true, error: null });
    } catch {
      // Token is invalid/expired — clear everything
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
