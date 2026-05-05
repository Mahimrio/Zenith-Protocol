/**
 * @file ScoreDisplay.tsx
 * @description Score display component using JetBrains Mono and GSAP countTo effect.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface ScoreDisplayProps {
  score: number;
  label?: string;
  animated?: boolean;
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  label,
  animated = false,
  className = ''
}) => {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const currentScoreRef = useRef({ val: 0 });

  useEffect(() => {
    if (!animated) {
      if (scoreRef.current) {
        scoreRef.current.innerText = score.toString();
      }
      return;
    }

    gsap.to(currentScoreRef.current, {
      val: score,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => {
        if (scoreRef.current) {
          scoreRef.current.innerText = Math.round(currentScoreRef.current.val).toString();
        }
      }
    });
  }, [score, animated]);

  return (
    <div className={`flex flex-col items-center justify-center font-mono text-neon-amber ${className}`}>
      {label && <span className="text-xs text-text-muted mb-1 uppercase tracking-wider">{label}</span>}
      <span
        ref={scoreRef}
        className="text-4xl font-bold"
        style={{ textShadow: '0 0 8px #f59e0b, 0 0 24px #f59e0b40' }}
      >
        {!animated ? score : 0}
      </span>
    </div>
  );
};
