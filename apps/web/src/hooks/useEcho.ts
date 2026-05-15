/**
 * @file useEcho.ts
 * @description Singleton Laravel Echo instance configured for Reverb.
 *
 * Reverb speaks the Pusher protocol, so we use pusher-js as the
 * transport driver. The instance is created once and shared across
 * the entire app — multiple useEcho() calls return the same object.
 *
 * @returns {{ subscribe, unsubscribe }} — thin wrappers around Echo channels.
 */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useRef, useCallback } from 'react';

// Pusher must be on `window` for laravel-echo to find it
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}
window.Pusher = Pusher;

/** Singleton Echo instance — created on first access. */
let echoInstance: Echo<'reverb'> | null = null;

/**
 * Lazily creates and returns the Echo singleton.
 * Reads Reverb connection params from Vite env vars.
 */
function getEcho(): Echo<'reverb'> {
  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
      wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
      forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
    });
  }
  return echoInstance;
}

/** Channel subscription tracker to avoid duplicate subscriptions. */
interface UseEchoReturn {
  /** Subscribe to a public channel. Returns the channel instance. */
  subscribe: (channelName: string) => ReturnType<Echo<'reverb'>['channel']>;
  /** Leave (unsubscribe from) a channel. */
  unsubscribe: (channelName: string) => void;
}

/**
 * Hook providing subscribe/unsubscribe helpers backed by the Echo singleton.
 *
 * @example
 * ```ts
 * const { subscribe, unsubscribe } = useEcho();
 * const channel = subscribe('leaderboard.dojo-3d');
 * channel.listen('.score.submitted', handler);
 * // later…
 * unsubscribe('leaderboard.dojo-3d');
 * ```
 */
export const useEcho = (): UseEchoReturn => {
  const echo = useRef(getEcho());

  const subscribe = useCallback(
    (channelName: string) => echo.current.channel(channelName),
    [],
  );

  const unsubscribe = useCallback(
    (channelName: string) => echo.current.leave(channelName),
    [],
  );

  return { subscribe, unsubscribe };
};
