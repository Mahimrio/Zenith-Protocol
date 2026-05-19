/**
 * @file VirtualJoystick.tsx
 * @description Custom virtual joystick for mobile Dojo 3D movement.
 *
 * Renders only on mobile. Bottom-left corner, 120px, neon-cyan.
 * Uses pointer events for drag tracking. Outputs normalized {x, y} vector.
 */
import React, { useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { useIsMobile } from '@sdk/utils/device';

export interface JoystickVector {
  x: number;
  y: number;
}

export interface VirtualJoystickProps {
  onVectorChange: (vector: JoystickVector) => void;
}

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 48;
const MAX_RADIUS = JOYSTICK_SIZE / 2 - KNOB_SIZE / 2;

/**
 * Virtual joystick for mobile movement input.
 */
export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onVectorChange }) => {
  const isMobile = useIsMobile();
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const baseCenter = useRef({ x: 0, y: 0 });

  const resetKnob = useCallback(() => {
    if (knobRef.current) {
      gsap.to(knobRef.current, { x: 0, y: 0, duration: 0.15, ease: 'power2.out' });
    }
    onVectorChange({ x: 0, y: 0 });
  }, [onVectorChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (pointerId.current !== null) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointerId.current = e.pointerId;

    if (baseRef.current) {
      const rect = baseRef.current.getBoundingClientRect();
      baseCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;

    const dx = e.clientX - baseCenter.current.x;
    const dy = e.clientY - baseCenter.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(distance, MAX_RADIUS);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * clamped;
    const ny = Math.sin(angle) * clamped;

    if (knobRef.current) {
      gsap.set(knobRef.current, { x: nx, y: ny });
    }

    onVectorChange({
      x: nx / MAX_RADIUS,
      y: ny / MAX_RADIUS,
    });
  }, [onVectorChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    resetKnob();
  }, [resetKnob]);

  useEffect(() => {
    return () => {
      pointerId.current = null;
    };
  }, []);

  if (!isMobile) return null;

  return (
    <div
      className="absolute bottom-8 left-8 z-30 select-none touch-none"
      style={{ width: JOYSTICK_SIZE, height: JOYSTICK_SIZE }}
    >
      {/* Base ring */}
      <div
        ref={baseRef}
        className="absolute inset-0 rounded-full border-2 border-neon-cyan/40 bg-black/30 backdrop-blur-sm"
        style={{ boxShadow: '0 0 12px #00f5ff40' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {/* Knob */}
      <div
        ref={knobRef}
        className="absolute rounded-full bg-neon-cyan/80"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          top: (JOYSTICK_SIZE - KNOB_SIZE) / 2,
          left: (JOYSTICK_SIZE - KNOB_SIZE) / 2,
          boxShadow: '0 0 8px #00f5ff, 0 0 16px #00f5ff60',
        }}
      />
    </div>
  );
};
