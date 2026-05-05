/**
 * @file backgroundLayers.ts
 * @description Parallax layer definitions.
 */
export const layers = [
  {
    speedMultiplier: 0.1,
    drawFunction: (ctx: CanvasRenderingContext2D, offset: number, width: number, height: number) => {
      ctx.fillStyle = '#2d1b4e';
      const baseHeight = height * 0.4;
      for(let i = 0; i < width * 2; i += 60) {
         const h = baseHeight + Math.sin(i * 0.05) * 50 + Math.cos(i * 0.1) * 30;
         const x = (i - offset) % (width * 2);
         const drawX = x < -60 ? x + width * 2 : x;
         ctx.fillRect(drawX, height - h, 61, h);
      }
    }
  },
  {
    speedMultiplier: 0.25,
    drawFunction: (ctx: CanvasRenderingContext2D, offset: number, width: number, height: number) => {
      ctx.fillStyle = '#10101a';
      const baseHeight = height * 0.3;
      for(let i = 0; i < width * 2; i += 100) {
         const h = baseHeight + Math.sin(i * 0.1) * 80;
         const x = (i - offset) % (width * 2);
         const drawX = x < -100 ? x + width * 2 : x;
         ctx.fillRect(drawX, height - h, 80, h);
         
         ctx.fillStyle = '#00f5ff';
         for(let wy = height - h + 20; wy < height - 20; wy += 20) {
           if (Math.sin(wy * i) > 0.5) ctx.fillRect(drawX + 20, wy, 10, 10);
           if (Math.cos(wy * i) > 0.5) ctx.fillRect(drawX + 50, wy, 10, 10);
         }
         ctx.fillStyle = '#10101a';
      }
    }
  },
  {
    speedMultiplier: 0.5,
    drawFunction: (ctx: CanvasRenderingContext2D, offset: number, width: number, height: number) => {
      ctx.font = '20px monospace';
      ctx.fillStyle = '#f59e0b';
      for(let i = 0; i < width * 2; i += 300) {
         const x = (i - offset) % (width * 2);
         const drawX = x < -100 ? x + width * 2 : x;
         ctx.fillText('ZENITH', drawX, height - 100);
         ctx.fillRect(drawX, height - 90, 5, 90);
      }
    }
  },
  {
    speedMultiplier: 1.0,
    drawFunction: (ctx: CanvasRenderingContext2D, offset: number, width: number, height: number) => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, height - 40, width, 40);
      
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(0, height - 40, width, 2);
      
      ctx.fillStyle = '#10b981';
      for(let i = 0; i < width * 2; i += 40) {
         const x = (i - offset) % (width * 2);
         const drawX = x < -40 ? x + width * 2 : x;
         ctx.fillRect(drawX, height - 20, 20, 2);
      }
    }
  }
];
