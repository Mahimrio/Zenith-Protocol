/**
 * @file device.ts
 * @description Device detection utilities for touch/mobile optimization.
 */
import { useState, useEffect } from 'react';

/** Returns true if the device supports touch events. */
export const isTouchDevice = (): boolean =>
  'ontouchstart' in window || navigator.maxTouchPoints > 0;

/** Returns true if the device is touch-enabled and viewport < 768px. */
export const isMobile = (): boolean =>
  isTouchDevice() && window.innerWidth < 768;

/**
 * React hook that tracks mobile state and updates on resize.
 * @returns boolean — true when running on a mobile/touch device.
 */
export const useIsMobile = (): boolean => {
  const [mobile, setMobile] = useState(isMobile);

  useEffect(() => {
    const check = () => setMobile(isMobile());
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return mobile;
};
