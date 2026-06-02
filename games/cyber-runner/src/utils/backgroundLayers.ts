/**
 * @file backgroundLayers.ts
 * @description Parallax layer definitions.
 */

const stars: {x: number, y: number, s: number, a: number}[] = [];
for (let i = 0; i < 60; i++) {
  stars.push({
    x: Math.random(),
    y: Math.random() * 0.65,
    s: 0.5 + Math.random(),
    a: 0.4 + Math.random() * 0.4
  });
}

export function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  grad.addColorStop(0, '#050510');
  grad.addColorStop(0.5, '#0a0520');
  grad.addColorStop(1, '#0f0a2a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.65);

  ctx.save();
  const mx = w * 0.82;
  const my = h * 0.15;
  for (let i = 3; i >= 1; i--) {
    ctx.beginPath();
    ctx.arc(mx, my, 28 + (i * 10), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 140, 255, ${0.05 / i})`;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(mx, my, 28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(180, 140, 255, 0.15)';
  ctx.fill();
  ctx.restore();

  stars.forEach(star => {
    ctx.fillStyle = `rgba(200, 220, 255, ${star.a})`;
    ctx.fillRect(star.x * w, star.y * h, star.s, star.s);
  });
}

export const layers = [
  {
    speedMultiplier: 0.1,
    drawFunction: (ctx: CanvasRenderingContext2D, offset: number, width: number, height: number, totalTime: number) => {
      const baseHeight = height * 0.4;
      for(let i = 0; i < width * 2; i += 60) {
         const h = baseHeight + Math.sin(i * 0.05) * 50 + Math.cos(i * 0.1) * 30;
         const x = (i - offset) % (width * 2);
         const drawX = x < -60 ? x + width * 2 : x;
         
         const grad = ctx.createLinearGradient(drawX, height - h, drawX, height);
         grad.addColorStop(0, '#16113a');
         grad.addColorStop(1, '#0d0a20');
         ctx.fillStyle = grad;
         ctx.fillRect(drawX, height - h, 61, h);

         if (i % 300 === 0) {
           ctx.fillStyle = '#00f5ff';
           ctx.fillRect(drawX + 30, height - h - 15, 2, 15);
           const blink = Math.sin(totalTime * 2 + i) > 0.5 ? '#ff0044' : '#660022';
           ctx.fillStyle = blink;
           ctx.fillRect(drawX + 29, height - h - 17, 4, 4);
         }

         for(let wy = height - h + 20; wy < height - 20; wy += 20) {
           if (Math.sin(wy * i) > 0.6) {
             ctx.fillStyle = Math.cos(wy + i) > 0.33 ? '#00f5ff' : '#f59e0b';
             ctx.fillRect(drawX + 10, wy, 8, 8);
           }
           if (Math.cos(wy * i) > 0.6) {
             ctx.fillStyle = Math.sin(wy + i) > 0.33 ? '#00f5ff' : '#f59e0b';
             ctx.fillRect(drawX + 40, wy, 8, 8);
           }
         }
      }
    }
  },
  {
    speedMultiplier: 0.25,
    drawFunction: (ctx: CanvasRenderingContext2D, offset: number, width: number, height: number, _totalTime: number) => {
      const baseHeight = height * 0.3;
      for(let i = 0; i < width * 2; i += 100) {
         const h = baseHeight + Math.sin(i * 0.1) * 80;
         const x = (i - offset) % (width * 2);
         const drawX = x < -100 ? x + width * 2 : x;
         
         ctx.fillStyle = '#10101a';
         ctx.fillRect(drawX, height - h, 80, h);
         
         if (i % 200 === 0) {
           ctx.fillStyle = '#8b5cf6';
           ctx.fillRect(drawX + 76, height - h, 2, h);
         }

         if (i % 300 === 0 && h > 100) {
           const colors = ['#00f5ff', '#8b5cf6', '#f59e0b', '#10b981'];
           const color = colors[(i / 100) % colors.length];
           ctx.fillStyle = '#0a0a0f';
           ctx.fillRect(drawX - 5, height - h + 30, 90, 40);
           ctx.fillStyle = color;
           ctx.shadowColor = color;
           ctx.shadowBlur = 8;
           ctx.fillRect(drawX, height - h + 35, 80, 30);
           ctx.shadowBlur = 0;
         }

         for(let wy = height - h + 20; wy < height - 20; wy += 20) {
           if (Math.sin(wy * i) > 0.5) {
             ctx.fillStyle = '#00f5ff';
             ctx.fillRect(drawX + 20, wy, 10, 10);
           }
           if (Math.cos(wy * i) > 0.5) {
             ctx.fillStyle = '#00f5ff';
             ctx.fillRect(drawX + 50, wy, 10, 10);
           }
         }
      }
    }
  },
  {
    speedMultiplier: 0.5,
    drawFunction: (ctx: CanvasRenderingContext2D, offset: number, width: number, height: number, _totalTime: number) => {
      for(let i = 0; i < width * 2; i += 300) {
         const x = (i - offset) % (width * 2);
         const drawX = x < -100 ? x + width * 2 : x;
         
         ctx.fillStyle = '#050510';
         ctx.fillRect(drawX, height - 120, 6, 120);
         
         const signColors = ['#ff3366', '#00f5ff', '#8b5cf6'];
         const sColor = signColors[(i / 300) % signColors.length];
         ctx.fillStyle = '#0a0a0f';
         ctx.fillRect(drawX + 6, height - 110, 60, 30);
         
         ctx.fillStyle = sColor;
         ctx.shadowColor = sColor;
         ctx.shadowBlur = 10;
         ctx.fillRect(drawX + 10, height - 105, 52, 20);
         ctx.shadowBlur = 0;
         
         ctx.fillStyle = '#ff3366';
         ctx.fillRect(drawX + 150, height - 25, 12, 25);
         ctx.fillStyle = '#f59e0b';
         ctx.fillRect(drawX + 148, height - 25, 16, 4);

         ctx.fillStyle = 'rgba(0, 245, 255, 0.4)';
         ctx.fillRect(drawX + 80, height - 5, 40, 2);
      }
    }
  },
  {
    speedMultiplier: 1.0,
    drawFunction: (ctx: CanvasRenderingContext2D, offset: number, width: number, height: number, _totalTime: number) => {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, height - 40, width, 40);
      
      ctx.fillStyle = '#1a1a3a';
      ctx.fillRect(0, height - 40, width, 1);
      
      ctx.fillStyle = 'rgba(0,245,255,0.25)';
      for(let i = 0; i < width * 2; i += 55) {
         const x = (i - offset) % (width * 2);
         const drawX = x < -55 ? x + width * 2 : x;
         ctx.fillRect(drawX, height - 20, 40, 2);
      }

      ctx.save();
      ctx.fillStyle = 'rgba(0, 245, 255, 0.6)';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 6;
      ctx.fillRect(0, height - 40, width, 2);
      ctx.restore();

      const grad = ctx.createLinearGradient(0, height - 38, 0, height - 30);
      grad.addColorStop(0, 'rgba(0, 245, 255, 0.15)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, height - 38, width, 8);
    }
  }
];
