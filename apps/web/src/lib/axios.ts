/**
 * @file axios.ts
 * @description Pre-configured axios instance for the Zenith Protocol API.
 *
 * - baseURL uses VITE_API_URL env var (defaults to `/api` for Vite proxy in dev).
 * - Request interceptor: attaches Bearer token from authStore if available.
 * - Response interceptor: on 401 → clears auth state and redirects to /login.
 */
import axios from 'axios';
import { useAuthStore } from '@store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ── Request: attach Bearer token ─────────────────────────────── */
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Response: handle 401 globally ────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      void useAuthStore.getState().logout();
      // Redirect without React Router (works from outside component tree)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
