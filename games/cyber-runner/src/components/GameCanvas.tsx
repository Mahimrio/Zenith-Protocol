/**
 * @file GameCanvas.tsx
 * @description Main Canvas Renderer.
 */
import React, { useRef, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { usePhysics } from '../hooks/usePhysics';
import { useParallax } from '../hooks/useParallax';
import { useObstacles } from '../hooks/useObstacles';
import { checkPlayerObstacleCollision } from '../utils/collision';
import { useRunnerStore } from '../store/runnerStore';
import { useInputHandler } from '../hooks/useInputHandler';
import { TouchControls } from './TouchControls';

export const GameCanvas: React.FC<{ onGameSpeedUpdate: (speed: number) => void }> = ({ onGameSpeedUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state: _pState, update: pUpdate, jump, slide } = usePhysics();
  const { updateAndDraw } = useParallax();
  const { obstacles: _obstacles, update: obsUpdate, draw: obsDraw, reset: obsReset } = useObstacles();
  const { incrementDistance, triggerGameOver, gameStatus } = useRunnerStore();
  
  const gameSpeedRef = useRef(280);
  const timeRef = useRef(0);
  const trailRef = useRef<{x: number, y: number, isSliding: boolean}[]>([]);

  useInputHandler(jump, slide, gameStatus === 'PLAYING');

  const { start, stop } = useGameLoop((deltaTime, _totalTime) => {
    if (gameStatus !== 'PLAYING') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    timeRef.current += deltaTime;
    if (timeRef.current > 10) {
      timeRef.current -= 10;
      gameSpeedRef.current += 15;
      onGameSpeedUpdate(Math.floor((gameSpeedRef.current - 280) / 15) + 1);
    }

    incrementDistance(gameSpeedRef.current * deltaTime);
    
    const groundLevel = canvas.height - 40;
    const player = pUpdate(deltaTime, groundLevel);
    const currentObstacles = obsUpdate(gameSpeedRef.current, deltaTime, canvas.width);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateAndDraw(ctx, gameSpeedRef.current, deltaTime, canvas.width, canvas.height);
    obsDraw(ctx, groundLevel);

    const pWidth = 40;
    const pHeight = player.isSliding ? 40 : 80;
    const drawY = player.y - pHeight;
    
    trailRef.current.unshift({ x: player.x, y: drawY, isSliding: player.isSliding });
    if (trailRef.current.length > 10) trailRef.current.pop();
    
    trailRef.current.forEach((t, i) => {
      if (i % 2 === 0 && i > 0) {
        ctx.fillStyle = `rgba(0, 245, 255, ${0.3 - i * 0.03})`;
        ctx.fillRect(t.x - i * 2, t.y, pWidth, t.isSliding ? 40 : 80);
      }
    });

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#0a0a0f';
    
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(player.x, drawY, pWidth, pHeight, 8);
    } else {
      ctx.rect(player.x, drawY, pWidth, pHeight);
    }
    ctx.fill();
    ctx.stroke();
    
    // Head logic
    ctx.beginPath();
    ctx.arc(player.x + pWidth/2, drawY - (player.isSliding ? -10 : 15), 12, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    const pHitbox = {
      x: player.x,
      y: drawY,
      w: pWidth,
      h: pHeight
    };

    let hit = false;
    for (const obs of currentObstacles) {
      const oHitbox = {
        x: obs.x,
        y: groundLevel - obs.y - obs.height,
        w: obs.width,
        h: obs.height
      };
      if (checkPlayerObstacleCollision(pHitbox, oHitbox, player.isSliding)) {
        console.log('COLLISION DETECTED', pHitbox, oHitbox);
        hit = true;
        break;
      }
    }

    if (hit) {
      triggerGameOver();
      stop();
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
      gameSpeedRef.current = 280;
      timeRef.current = 0;
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [gameStatus, start, stop, obsReset]);

  return (
    <>
      <canvas ref={canvasRef} className="block w-full h-full bg-[#0a0a0f]" />
      <TouchControls onJump={jump} onSlide={slide} />
    </>
  );
};
