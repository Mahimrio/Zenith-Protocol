/**
 * @file GameCanvas.tsx
 * @description Main Canvas Renderer.
 */
import React, { useRef, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { usePhysics } from '../hooks/usePhysics';
import { useParallax } from '../hooks/useParallax';
import { drawSky } from '../utils/backgroundLayers';
import { useObstacles } from '../hooks/useObstacles';
import { useRunnerStore, RUNNER_SPEED } from '../store/runnerStore';
import { ObstacleType, type Obstacle } from '../utils/obstacleFactory';
import { checkPlayerObstacleCollision } from '../utils/collision';
import { playSfx } from '@sdk/store/soundStore';
import { useInputHandler } from '../hooks/useInputHandler';
import { TouchControls } from './TouchControls';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state: _pState, update: pUpdate, jump, slide, stopSlide } = usePhysics();
  const { updateAndDraw } = useParallax();
  const { update: obsUpdate, reset: obsReset } = useObstacles();
  const incrementDistance = useRunnerStore(s => s.incrementDistance);
  const triggerGameOver = useRunnerStore(s => s.triggerGameOver);
  const gameStatus = useRunnerStore(s => s.gameStatus);

  const gameSpeedRef = useRef<number>(RUNNER_SPEED.INITIAL_SPEED);
  const timeRef = useRef(0);
  const spriteSheetRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/images/cyber-runner/spritesheet.png';
    spriteSheetRef.current = img;
  }, []);

  useInputHandler(jump, slide, stopSlide, gameStatus === 'PLAYING');

  const drawToxicPlant = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    baseY: number,
    w: number,
    h: number,
    t: number
  ) => {
    const stemCount = 3;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < stemCount; i++) {
      const offsetX = (i - 1) * (w / 4);
      const sway = Math.sin(t * 1.5 + i * 1.2) * 4;
      const stemH = h * (0.85 + (i % 2) * 0.15);
      const tipX = cx + offsetX + sway;
      const tipY = baseY - stemH;
      const ctrlX = cx + offsetX + sway * 1.6;
      const ctrlY = baseY - stemH * 0.55;

      ctx.strokeStyle = '#0a0a0f';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(cx + offsetX, baseY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.stroke();

      ctx.strokeStyle = '#1d6e6e';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx + offsetX, baseY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.stroke();

      ctx.shadowColor = '#10ff80';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#10ff80';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + offsetX, baseY - stemH * 0.15);
      ctx.quadraticCurveTo(ctrlX, ctrlY + stemH * 0.1, tipX, tipY + 4);
      ctx.stroke();

      for (let v = 0; v < 4; v++) {
        const vt = 0.2 + v * 0.2;
        const px = (1 - vt) * (1 - vt) * (cx + offsetX) + 2 * (1 - vt) * vt * ctrlX + vt * vt * tipX;
        const py = (1 - vt) * (1 - vt) * baseY + 2 * (1 - vt) * vt * ctrlY + vt * vt * tipY;
        ctx.fillStyle = '#10ff80';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px + (v % 2 === 0 ? 3 : -3), py - 4, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    ctx.shadowColor = '#ff5fb0';
    ctx.shadowBlur = 10;
    for (let i = 0; i < stemCount; i++) {
      const offsetX = (i - 1) * (w / 4);
      const sway = Math.sin(t * 1.5 + i * 1.2) * 4;
      const tipX = cx + offsetX + sway;
      const tipY = baseY - h * (0.85 + (i % 2) * 0.15);

      if (i === 0 || i === 2) {
        const fx = tipX + Math.cos(t * 0.8 + i) * 2;
        const fy = tipY - 4;
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        for (let p = 0; p < 5; p++) {
          const a = (Math.PI * 2 / 5) * p - Math.PI / 2;
          const r = p === 0 ? 5 : 4;
          ctx.lineTo(fx + Math.cos(a) * r, fy + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd1e8';
        ctx.beginPath();
        for (let p = 0; p < 5; p++) {
          const a = (Math.PI * 2 / 5) * p - Math.PI / 2;
          const r = p === 0 ? 3.5 : 2.5;
          ctx.lineTo(fx + Math.cos(a) * r, fy + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ff5fb0';
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawSpikeCube = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    t: number
  ) => {
    const bob = Math.sin(t * 3) * 3;
    const rot = t * 0.6;
    const half = size / 2;
    const spikeLen = size * 0.28;

    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.rotate(rot);

    const faceOffset = size * 0.22;
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.moveTo(-half, -half + faceOffset);
    ctx.lineTo(0, -half);
    ctx.lineTo(half, -half + faceOffset);
    ctx.lineTo(half, half);
    ctx.lineTo(-half, half);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-half + 2, -half + faceOffset + 2);
    ctx.lineTo(0, -half + 2);
    ctx.lineTo(half - 2, -half + faceOffset + 2);
    ctx.lineTo(half - 2, half - 2);
    ctx.lineTo(-half + 2, half - 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 4;
    ctx.lineWidth = 1;
    for (let r = 0; r < 3; r++) {
      const yy = -half + faceOffset + 6 + r * 4;
      ctx.beginPath();
      ctx.moveTo(-half + 4, yy);
      ctx.lineTo(half - 4, yy);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.rotate(-rot);

    const spikePositions: [number, number, number][] = [
      [0, -half - spikeLen * 0.4, 0],
      [half + spikeLen * 0.4, 0, Math.PI / 2],
      [-half - spikeLen * 0.4, 0, -Math.PI / 2],
      [0, half + spikeLen * 0.4, Math.PI],
      [half * 0.7, -half * 0.7 - spikeLen * 0.3, Math.PI / 4],
      [-half * 0.7, -half * 0.7 - spikeLen * 0.3, -Math.PI / 4],
      [half * 0.7, half * 0.7 + spikeLen * 0.3, Math.PI * 0.75],
      [-half * 0.7, half * 0.7 + spikeLen * 0.3, -Math.PI * 0.75],
    ];

    spikePositions.forEach(([sx, sy, angle]) => {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.moveTo(0, -spikeLen);
      ctx.lineTo(4, 0);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(0, -spikeLen + 1.5);
      ctx.lineTo(2.5, -1);
      ctx.lineTo(-2.5, -1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawCrystalCluster = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    baseY: number,
    w: number,
    h: number,
    _t: number
  ) => {
    const crystals: { dx: number; dy: number; angle: number; size: number; color: string; glow: string }[] = [
      { dx: -w * 0.32, dy: -h * 0.55, angle: -0.15, size: h * 0.9, color: '#10ff80', glow: '#10ff80' },
      { dx: -w * 0.05, dy: -h * 0.85, angle: 0.08, size: h * 1.15, color: '#00f5ff', glow: '#00f5ff' },
      { dx: w * 0.18, dy: -h * 0.7, angle: -0.05, size: h * 1.0, color: '#ff3df0', glow: '#ff3df0' },
      { dx: w * 0.32, dy: -h * 0.4, angle: 0.18, size: h * 0.75, color: '#a78bfa', glow: '#a78bfa' },
      { dx: -w * 0.22, dy: -h * 0.25, angle: 0.22, size: h * 0.6, color: '#ff3df0', glow: '#ff3df0' },
    ];

    const glitchX = (Math.random() < 0.04 ? (Math.random() - 0.5) * 3 : 0);

    ctx.save();
    ctx.translate(glitchX, 0);
    ctx.lineJoin = 'round';

    crystals.forEach((c) => {
      const px = cx + c.dx;
      const py = baseY + c.dy;
      const s = c.size;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(c.angle);

      ctx.shadowColor = c.glow;
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(s * 0.32, -s * 0.1);
      ctx.lineTo(s * 0.22, s / 2);
      ctx.lineTo(-s * 0.22, s / 2);
      ctx.lineTo(-s * 0.32, -s * 0.1);
      ctx.closePath();
      ctx.fill();

      const grad = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
      grad.addColorStop(0, c.color);
      grad.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -s / 2 + 2);
      ctx.lineTo(s * 0.28, -s * 0.1);
      ctx.lineTo(s * 0.18, s / 2 - 1);
      ctx.lineTo(-s * 0.18, s / 2 - 1);
      ctx.lineTo(-s * 0.28, -s * 0.1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#0a0a0f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -s / 2);
      ctx.lineTo(0, s / 2);
      ctx.stroke();

      ctx.strokeStyle = c.color;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.3);
      ctx.lineTo(-s * 0.05, s * 0.3);
      ctx.stroke();

      ctx.restore();
    });

    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawLaserField = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    baseY: number,
    w: number,
    h: number,
    t: number
  ) => {
    ctx.save();

    const anchorTopY = baseY - h;
    const anchorBotY = baseY;
    const beamCount = 6;
    const pulse = 0.7 + Math.sin(t * 4) * 0.3;

    for (let layer = 0; layer < 3; layer++) {
      const layerAlpha = 0.25 + (2 - layer) * 0.15;
      ctx.globalAlpha = layerAlpha;
      ctx.strokeStyle = '#00f5ff';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = layer === 0 ? 18 : 6;
      ctx.lineCap = 'round';

      for (let i = 0; i < beamCount; i++) {
        const seed = (i + 1) * 1.7;
        const topAnchorX = cx + (i - beamCount / 2) * 4;
        const botAnchorX = cx + Math.sin(t * 1.2 + seed) * (w * 0.45);
        const ctrlX = cx + Math.cos(t * 0.7 + seed) * (w * 0.55);
        const ctrlY = (anchorTopY + anchorBotY) / 2 + Math.sin(t * 2 + seed) * 4;

        ctx.lineWidth = layer === 0 ? 4.5 : (layer === 1 ? 2.5 : 1.2);
        ctx.beginPath();
        ctx.moveTo(topAnchorX + (i - beamCount / 2) * 2, anchorTopY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, botAnchorX, anchorBotY);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 12 * pulse;
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.arc(cx, anchorTopY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(cx, anchorTopY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.arc(cx, anchorBotY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(cx, anchorBotY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawObstacles = (
    ctx: CanvasRenderingContext2D,
    groundLevel: number,
    totalTime: number,
    obstacles: Obstacle[]
  ) => {
    obstacles.forEach(obs => {
      const topY = groundLevel - obs.y - obs.height;
      const bottomY = groundLevel - obs.y;
      const cx = obs.x + obs.width / 2;
      const cy = topY + obs.height / 2;

      if (obs.type === ObstacleType.TOXIC_PLANT) {
        drawToxicPlant(ctx, cx, bottomY, obs.width, obs.height, totalTime + obs.phase);
      } else if (obs.type === ObstacleType.SPIKE_CUBE) {
        drawSpikeCube(ctx, cx, cy, obs.width, totalTime + obs.phase);
      } else if (obs.type === ObstacleType.CRYSTAL_CLUSTER) {
        drawCrystalCluster(ctx, cx, bottomY, obs.width, obs.height, totalTime + obs.phase);
      } else if (obs.type === ObstacleType.LASER_FIELD) {
        drawLaserField(ctx, cx, bottomY, obs.width, obs.height, totalTime + obs.phase);
      }
    });
  };

  const { start, stop } = useGameLoop((deltaTime, totalTime) => {
    if (gameStatus !== 'PLAYING') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    timeRef.current += deltaTime;
    if (timeRef.current > RUNNER_SPEED.SPEED_INTERVAL) {
      timeRef.current -= RUNNER_SPEED.SPEED_INTERVAL;
      gameSpeedRef.current = Math.min(
        gameSpeedRef.current + RUNNER_SPEED.SPEED_INCREMENT,
        RUNNER_SPEED.MAX_SPEED
      );
      useRunnerStore.getState().incrementSpeedLevel();
    }

    incrementDistance(gameSpeedRef.current * deltaTime);
    
    const groundLevel = canvas.height - 40;
    const player = pUpdate(deltaTime, groundLevel);
    const currentObstacles = obsUpdate(gameSpeedRef.current, deltaTime, canvas.width);

    const hitboxW = 32;
    const hitboxH = player.isSliding ? 36 : 72;
    const pHitbox = {
      x: player.x,
      y: player.y - hitboxH,
      w: hitboxW,
      h: hitboxH
    };

    let collided = false;
    for (const obs of currentObstacles) {
      const oHitbox = {
        x: obs.x,
        y: groundLevel - obs.y - obs.height,
        w: obs.width,
        h: obs.height
      };
      if (checkPlayerObstacleCollision(pHitbox, oHitbox, player.isSliding)) {
        collided = true;
        break;
      }
    }

    if (collided) {
      playSfx('/sounds/runner/jump.mp3');
      triggerGameOver();
      stop();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky(ctx, canvas.width, canvas.height);
    updateAndDraw(ctx, gameSpeedRef.current, deltaTime, totalTime, canvas.width, canvas.height);
    drawObstacles(ctx, groundLevel, totalTime, currentObstacles);

    const SPRITE_COLS = 5;
    const SPRITE_ROWS = 3;
    const DISPLAY_H = 130;
    const sprite = spriteSheetRef.current;
    const spriteReady = sprite && sprite.complete && sprite.naturalWidth > 0;

    if (spriteReady) {
      const cellW = sprite.naturalWidth / SPRITE_COLS;
      const cellH = sprite.naturalHeight / SPRITE_ROWS;
      const spriteW = DISPLAY_H * (cellW / cellH);
      const spriteCx = player.x + 16;
      const spriteTop = player.y - DISPLAY_H;

      let row = 0;
      let col = 0;

      if (player.isSliding) {
        row = 2;
        col = Math.floor((totalTime * 2) % SPRITE_COLS);
      } else if (!player.isGrounded) {
        row = 1;
        col = 2;
      } else {
        row = 0;
        col = Math.floor((totalTime * 2.5) % SPRITE_COLS);
      }

      const sx = col * cellW;
      const sy = row * cellH;
      const dx = spriteCx - spriteW / 2;
      let dy = spriteTop;
      let drawH = DISPLAY_H;
      let srcY = sy;
      let srcH = cellH;

      if (player.isSliding) {
        const cropTop = cellH * 0.18;
        const cropHeight = cellH * 0.65;
        srcY = sy + cropTop;
        srcH = cropHeight;
        const cropAspect = cellW / cropHeight;
        drawH = spriteW / cropAspect;
        dy = player.y - drawH;
      }

      ctx.drawImage(sprite, sx, srcY, cellW, srcH, dx, dy, spriteW, drawH);
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (gameStatus === 'PLAYING') {
      obsReset();
      gameSpeedRef.current = RUNNER_SPEED.INITIAL_SPEED;
      timeRef.current = 0;
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [gameStatus, start, stop, obsReset]);

  return (
    <div className="relative w-full h-full bg-bg-primary overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full outline-none touch-none"
        tabIndex={0}
      />
      <TouchControls onJump={jump} onSlide={slide} />
    </div>
  );
};
