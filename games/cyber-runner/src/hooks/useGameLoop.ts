/**
 * @file useGameLoop.ts
 * @description Core game loop utilizing requestAnimationFrame.
 */
import { useRef, useCallback, useEffect } from 'react';

export const useGameLoop = (callback: (deltaTime: number, totalTime: number) => void) => {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const isRunning = useRef(false);
  const totalTimeRef = useRef(0);

  const loop = useCallback((time: number) => {
    if (!isRunning.current) return;
    if (previousTimeRef.current !== undefined) {
      const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.1);
      totalTimeRef.current += deltaTime;
      callback(deltaTime, totalTimeRef.current);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(loop);
  }, [callback]);

  const start = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;
    previousTimeRef.current = 0;
    requestRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    isRunning.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [start, stop]);

  return { start, stop, isRunning };
};
