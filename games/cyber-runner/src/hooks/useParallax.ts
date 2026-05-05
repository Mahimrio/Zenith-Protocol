/**
 * @file useParallax.ts
 * @description Parallax scrolling hook.
 */
import { useRef } from 'react';
import { layers } from '../utils/backgroundLayers';

export const useParallax = () => {
  const offsets = useRef(new Array(layers.length).fill(0));

  const updateAndDraw = (ctx: CanvasRenderingContext2D, gameSpeed: number, deltaTime: number, width: number, height: number) => {
    layers.forEach((layer, i) => {
      offsets.current[i] += gameSpeed * layer.speedMultiplier * deltaTime;
      if (offsets.current[i] > width * 2) {
        offsets.current[i] %= width * 2;
      }
      layer.drawFunction(ctx, offsets.current[i], width, height);
    });
  };

  return { updateAndDraw };
};
