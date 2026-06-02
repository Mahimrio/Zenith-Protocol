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
import { usePowerups } from '../hooks/usePowerups';
import { checkPlayerObstacleCollision } from '../utils/collision';
import { useRunnerStore, RUNNER_SPEED } from '../store/runnerStore';
import { ObstacleType, type Obstacle, PowerupType, type Powerup } from '../utils/obstacleFactory';
import { playSfx } from '@sdk/store/soundStore';
import { useInputHandler } from '../hooks/useInputHandler';
import { TouchControls } from './TouchControls';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state: _pState, update: pUpdate, jump, slide } = usePhysics();
  const { updateAndDraw } = useParallax();
  const { update: obsUpdate, reset: obsReset } = useObstacles();
  const { update: pwrUpdate, reset: pwrReset } = usePowerups();
  const incrementDistance = useRunnerStore(s => s.incrementDistance);
  const triggerGameOver = useRunnerStore(s => s.triggerGameOver);
  const gameStatus = useRunnerStore(s => s.gameStatus);
  const activatePowerup = useRunnerStore(s => s.activatePowerup);
  const deactivatePowerup = useRunnerStore(s => s.deactivatePowerup);
  
  const gameSpeedRef = useRef<number>(RUNNER_SPEED.INITIAL_SPEED);
  const timeRef = useRef(0);
  const trailRef = useRef<{x: number, y: number, isSliding: boolean}[]>([]);

  useInputHandler(jump, slide, gameStatus === 'PLAYING');

  const drawObstacles = (
    ctx: CanvasRenderingContext2D,
    groundLevel: number,
    totalTime: number,
    obstacles: Obstacle[],
    playerX: number
  ) => {
    let showBarrierWarning = false;

    obstacles.forEach((obstacle) => {
      if ((obstacle as any).broken) return;

      if (obstacle.type === ObstacleType.BARRIER) {
        const distanceToPlayer = obstacle.x - playerX;
        if (distanceToPlayer > 0 && distanceToPlayer <= 200) {
          showBarrierWarning = true;
        }

        const x = obstacle.x;
        const y = groundLevel - obstacle.y - obstacle.height;
        ctx.save();
        ctx.fillStyle = '#1a0a1a';
        ctx.strokeStyle = '#ff3366';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, obstacle.width, obstacle.height);
        ctx.strokeRect(x, y, obstacle.width, obstacle.height);

        ctx.strokeStyle = 'rgba(255,51,102,0.4)';
        ctx.lineWidth = 1.5;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 2, y + (obstacle.height / 4) * i);
          ctx.lineTo(x + obstacle.width - 2, y + (obstacle.height / 4) * i);
          ctx.stroke();
        }

        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.moveTo(x + obstacle.width / 2, y - 14);
        ctx.lineTo(x + obstacle.width, y);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return;
      }

      if (obstacle.type === ObstacleType.LOW_BLOCK) {
        const x = obstacle.x;
        const slabHeight = obstacle.height;
        const slabY = groundLevel - obstacle.y - slabHeight;
        ctx.save();
        ctx.fillStyle = '#0a1a2a';
        ctx.strokeStyle = '#00aaff';
        ctx.shadowColor = '#00aaff';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 2;
        ctx.fillRect(x, slabY, obstacle.width, slabHeight);
        ctx.strokeRect(x, slabY, obstacle.width, slabHeight);

        ctx.strokeStyle = 'rgba(0,170,255,0.8)';
        ctx.lineWidth = 1.5;
        for (let s = 0; s < 3; s++) {
          ctx.beginPath();
          ctx.moveTo(x + 8 + s * 16, slabY);
          ctx.lineTo(x + 12 + s * 16 + Math.random() * 6 - 3, slabY - 8 - Math.random() * 6);
          ctx.lineTo(x + 16 + s * 16 + Math.random() * 4 - 2, slabY);
          ctx.stroke();
        }

        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.moveTo(x + obstacle.width / 2, slabY + 8);
        ctx.lineTo(x + obstacle.width / 2 + 12, slabY - 4);
        ctx.lineTo(x + obstacle.width / 2 - 12, slabY - 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return;
      }

      if (obstacle.type === ObstacleType.HOVER_MINE) {
        const mineY = groundLevel - obstacle.y - obstacle.height;
        obstacle.rotation += 0.03;

        ctx.save();
        ctx.translate(obstacle.x + obstacle.width / 2, mineY + obstacle.height / 2);
        ctx.rotate(obstacle.rotation);
        const scale = Math.sin(totalTime * 4) * 0.08 + 1;
        ctx.scale(scale, scale);
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#1a1a0a';
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const r = 16;
          if (i === 0) {
            ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          } else {
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i + Math.PI / 6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 16);
          ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24);
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    if (showBarrierWarning) {
      const pulse = 0.5 + Math.sin(totalTime * 8) * 0.5;
      ctx.save();
      ctx.globalAlpha = 0.35 + pulse * 0.65;
      ctx.fillStyle = '#ff3366';
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(16, 90);
      ctx.lineTo(32, 80);
      ctx.lineTo(32, 100);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  const drawPowerups = (ctx: CanvasRenderingContext2D, totalTime: number, powerups: Powerup[]) => {
    powerups.forEach(p => {
      const py = p.y + Math.sin(totalTime * 3) * 4;
      ctx.save();
      ctx.translate(p.x + p.width / 2, py + p.height / 2);
      ctx.rotate(totalTime * 0.8);
      
      ctx.shadowBlur = 16;
      if (p.type === PowerupType.SHIELD) {
        ctx.strokeStyle = '#00f5ff';
        ctx.shadowColor = '#00f5ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = '#00f5ff';
        ctx.beginPath();
        ctx.moveTo(0, -4); ctx.lineTo(4, -4); ctx.lineTo(4, 2);
        ctx.lineTo(0, 6); ctx.lineTo(-4, 2); ctx.lineTo(-4, -4);
        ctx.fill();
      } else if (p.type === PowerupType.GHOST) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.shadowColor = '#8b5cf6';
        ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -2, 8, Math.PI, 0);
        ctx.lineTo(8, 8); ctx.lineTo(3, 4); ctx.lineTo(0, 8);
        ctx.lineTo(-3, 4); ctx.lineTo(-8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (p.type === PowerupType.MAGNET) {
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -2, 6, Math.PI, 0, true);
        ctx.lineTo(6, 6);
        ctx.moveTo(-6, -2);
        ctx.lineTo(-6, 6);
        ctx.stroke();
      } else if (p.type === PowerupType.BOOST) {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.moveTo(-2, -8); ctx.lineTo(6, -2); ctx.lineTo(0, 0);
        ctx.lineTo(4, 8); ctx.lineTo(-6, 2); ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = ctx.shadowColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
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
    const currentPowerups = pwrUpdate(gameSpeedRef.current, deltaTime, canvas.width, groundLevel);

    const storeState = useRunnerStore.getState();
    const { activePowerup: curPowerup, powerupExpiresAt: curExpiry, shieldActive: curShield, ghostActive: curGhost } = storeState;

    if (curPowerup && Date.now() > curExpiry) {
      deactivatePowerup();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky(ctx, canvas.width, canvas.height);
    updateAndDraw(ctx, gameSpeedRef.current, deltaTime, totalTime, canvas.width, canvas.height);
    
    drawPowerups(ctx, totalTime, currentPowerups);
    drawObstacles(ctx, groundLevel, totalTime, currentObstacles, player.x);

    const hitboxW = 32;
    const hitboxH = player.isSliding ? 36 : 72;
    const visualScale = 1.7;
    const pWidth = hitboxW;
    const pHeight = hitboxH;
    const drawY = player.y - pHeight;
    const baseY = player.y - 72;
    const playerX = player.x;

    const visualCx = playerX + hitboxW / 2;
    const visualCy = player.y - hitboxH / 2;
    ctx.save();
    ctx.translate(visualCx, visualCy);
    ctx.scale(visualScale, visualScale);
    ctx.translate(-visualCx, -visualCy);

    ctx.save();
    ctx.fillStyle = 'rgba(0, 245, 255, 0.18)';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.ellipse(visualCx, player.y - 2, hitboxW * 0.8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    trailRef.current.unshift({ x: player.x, y: drawY, isSliding: player.isSliding });
    if (trailRef.current.length > 10) trailRef.current.pop();

    trailRef.current.forEach((t, i) => {
      ctx.fillStyle = `rgba(0, 245, 255, ${0.3 - (i * 0.03)})`;
      ctx.fillRect(t.x, t.y, hitboxW, t.isSliding ? 36 : 72);
    });

    ctx.save();
    if (player.isSliding) {
      ctx.translate(player.x, player.y);
      ctx.scale(1, 0.5);
      ctx.translate(-player.x, -player.y);
    }

    if (curGhost) {
      ctx.globalAlpha = 0.4 + (Math.sin(totalTime * 20) * 0.5 + 0.5) * 0.6;
    }

    // 1. LEFT ARM (Draw behind body)
    ctx.save();
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 8;
    
    const leftShoulderX = playerX + 12;
    const shoulderY = baseY + 30;
    const armLength = 16;
    
    let leftArmAngle = player.isSliding 
      ? Math.PI / 2.5 
      : (-20 + Math.sin(totalTime * 10 + Math.PI) * 35) * (Math.PI / 180);
      
    ctx.beginPath();
    ctx.moveTo(leftShoulderX, shoulderY);
    ctx.lineTo(leftShoulderX + Math.sin(leftArmAngle) * armLength, shoulderY + Math.cos(leftArmAngle) * armLength);
    ctx.stroke();
    ctx.restore();

    // 2. LEGS (Draw behind body)
    ctx.save();
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    if (player.isSliding) {
      // Horizontal leg stubs
      ctx.moveTo(playerX + 12, baseY + 54);
      ctx.lineTo(playerX - 4, baseY + 54);
      ctx.moveTo(playerX + 24, baseY + 54);
      ctx.lineTo(playerX + 42, baseY + 54);
      ctx.stroke();
    } else {
      // Animated vertical legs
      const legSwing = Math.sin(totalTime * 10);
      // Left leg
      ctx.moveTo(playerX + 14, baseY + 54);
      ctx.lineTo(playerX + 14 + legSwing * 10, baseY + 64);
      ctx.lineTo(playerX + 8 + legSwing * 16, baseY + 72);
      // Right leg
      ctx.moveTo(playerX + 22, baseY + 54);
      ctx.lineTo(playerX + 22 - legSwing * 10, baseY + 64);
      ctx.lineTo(playerX + 28 - legSwing * 16, baseY + 72);
      ctx.stroke();
    }
    ctx.restore();

    // 3. JETPACK DETAIL (behind torso, left side)
    ctx.save();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 8;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(playerX - 2, baseY + 28, 8, 20, 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(playerX - 2, baseY + 28, 8, 20);
    }

    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.fillRect(playerX - 1, baseY + 48, 2, 4);
    ctx.fillRect(playerX + 3, baseY + 48, 2, 4);
    ctx.restore();

    // 4. TORSO
    ctx.save();
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(playerX + 4, baseY + 30);
    ctx.lineTo(playerX + 30, baseY + 30);
    ctx.moveTo(playerX + 10, baseY + 54);
    ctx.lineTo(playerX + 24, baseY + 54);
    ctx.moveTo(playerX + 17, baseY + 32);
    ctx.lineTo(playerX + 17, baseY + 52);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 245, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(playerX + 12, baseY + 36);
    ctx.lineTo(playerX + 22, baseY + 36);
    ctx.moveTo(playerX + 12, baseY + 44);
    ctx.lineTo(playerX + 22, baseY + 44);
    ctx.stroke();

    const corePulse = 0.85 + Math.sin(totalTime * 4) * 0.15;
    ctx.fillStyle = '#00f5ff';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(playerX + 17, baseY + 40, 3 * corePulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. RIGHT ARM (Draw over body)
    ctx.save();
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 8;
    
    const rightShoulderX = playerX + 22;
    let rightArmAngle = player.isSliding 
      ? Math.PI / 2.5 
      : (-20 + Math.sin(totalTime * 10) * 35) * (Math.PI / 180);
    
    ctx.beginPath();
    ctx.moveTo(rightShoulderX, shoulderY);
    ctx.lineTo(rightShoulderX + Math.sin(rightArmAngle) * armLength, shoulderY + Math.cos(rightArmAngle) * armLength);
    ctx.stroke();
    ctx.restore();

    // 6. HEAD — angular helmet
    ctx.save();
    const headX = playerX + 6;
    const headY = baseY + 8;
    const headW = 20;
    const headH = 16;

    if (player.isSliding) {
      ctx.translate(headX + headW / 2, headY + headH / 2);
      ctx.rotate(Math.PI / 6);
      ctx.translate(-(headX + headW / 2), -(headY + headH / 2));
    }

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(headX + 2, headY + 14);
    ctx.lineTo(headX + 5, headY + 2);
    ctx.lineTo(headX + 15, headY + 2);
    ctx.lineTo(headX + 18, headY + 14);
    ctx.lineTo(headX + 18, headY + 16);
    ctx.lineTo(headX + 2, headY + 16);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(headX + 4, headY);
    ctx.lineTo(headX + 6, headY - 5);
    ctx.lineTo(headX + 8, headY);
    ctx.stroke();

    ctx.fillStyle = '#00f5ff';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 16;
    ctx.fillRect(headX + 4, headY + 9, 12, 3);

    ctx.strokeStyle = 'rgba(0, 245, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(headX + 6, headY + 14);
    ctx.lineTo(headX + 14, headY + 14);
    ctx.stroke();
    ctx.restore();
    
    ctx.restore(); // Restore sliding scale

    if (curGhost) {
      ctx.globalAlpha = 1.0;
    }

    if (curShield) {
      ctx.save();
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4 + Math.sin(totalTime * 6) * 0.15;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for(let i=0; i<6; i++) {
        const a = (Math.PI / 3) * i;
        const r = 45;
        const hx = playerX + 16 + Math.cos(a)*r;
        const hy = baseY + 36 + Math.sin(a)*r;
        if(i===0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    if (curPowerup === PowerupType.MAGNET) {
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      const orbitSpeed = totalTime * 4;
      for(let i=0; i<4; i++) {
        const a = orbitSpeed + (Math.PI / 2) * i;
        const r = 30;
        const px = playerX + 16 + Math.cos(a)*r;
        const py = baseY + 36 + Math.sin(a)*r;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (curPowerup === PowerupType.BOOST) {
      ctx.save();
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.translate(playerX + 16, baseY + 36);
      ctx.scale(1.5, 1.5);
      ctx.beginPath();
      ctx.moveTo(-2, -12); ctx.lineTo(8, -2); ctx.lineTo(0, 0);
      ctx.lineTo(6, 12); ctx.lineTo(-8, 2); ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 20;
      ctx.fillRect(playerX - 20, drawY + pHeight, pWidth + 40, 4);
      ctx.restore();
    }

    const auraPulse = 0.5 + Math.sin(totalTime * 4) * 0.5;
    ctx.save();
    ctx.strokeStyle = `rgba(0, 245, 255, ${0.18 + auraPulse * 0.22})`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(visualCx, visualCy, hitboxW * (1.4 + auraPulse * 0.15), hitboxH * (1.3 + auraPulse * 0.15), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    const pHitbox = {
      x: player.x,
      y: drawY,
      w: hitboxW,
      h: hitboxH
    };

    for (const p of currentPowerups) {
      if (!p.collected) {
        const pbox = { x: p.x, y: p.y, w: p.width, h: p.height };
        if (checkPlayerObstacleCollision(pHitbox, pbox, player.isSliding)) {
          p.collected = true;
          playSfx('/sounds/runner/powerup.mp3');
          activatePowerup(p.type);
          if (p.type === PowerupType.BOOST) {
            gameSpeedRef.current = Math.min(gameSpeedRef.current + 40, RUNNER_SPEED.MAX_SPEED);
            playSfx('/sounds/runner/boost-start.mp3');
          }
        }
      }
    }

    if (!curGhost) {
      for (let i = 0; i < currentObstacles.length; i++) {
        const obs = currentObstacles[i];
        if ((obs as any).broken) continue;

        const oHitbox = {
          x: obs.x,
          y: groundLevel - obs.y - obs.height,
          w: obs.width,
          h: obs.height
        };
        
        if (checkPlayerObstacleCollision(pHitbox, oHitbox, player.isSliding)) {
          if (curShield) {
            playSfx('/sounds/runner/shield-break.mp3');
            deactivatePowerup();
            (obs as any).broken = true;
          } else {
            triggerGameOver();
            stop();
          }
          break;
        }
      }
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
      pwrReset();
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
