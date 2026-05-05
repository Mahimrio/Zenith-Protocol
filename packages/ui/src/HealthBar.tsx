/**
 * @file HealthBar.tsx
 * @description Health bar component with GSAP animated width transition.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface HealthBarProps {
  current: number;
  max: number;
  color?: string;
  label?: string;
  className?: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  color = '#10b981', // default to neon-green
  label,
  className = ''
}) => {
  const fillRef = useRef<HTMLDivElement>(null);
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  useEffect(() => {
    if (fillRef.current) {
      gsap.to(fillRef.current, {
        width: `${percentage}%`,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [percentage]);

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-text-muted font-mono">
          <span>{label}</span>
          <span>{current} / {max}</span>
        </div>
      )}
      <div className="h-4 bg-glass backdrop-blur-md border border-glass rounded-xl overflow-hidden relative">
        <div
          ref={fillRef}
          className="absolute top-0 left-0 h-full rounded-xl"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}40`,
            width: '100%' // Set initial to 100%, GSAP manages width dynamically
          }}
        />
      </div>
    </div>
  );
};
