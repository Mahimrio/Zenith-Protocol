/**
 * @file GlassCard.tsx
 * @description A glassmorphic card component with optional neon glow.
 */
import React from 'react';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'neon-cyan' | 'neon-purple' | 'neon-amber' | 'neon-green';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glowColor }) => {
  const colors: Record<string, string> = {
    'neon-cyan': '#00f5ff',
    'neon-purple': '#8b5cf6',
    'neon-amber': '#f59e0b',
    'neon-green': '#10b981'
  };

  const glowStyles = glowColor ? {
    boxShadow: `0 0 8px ${colors[glowColor]}, 0 0 24px ${colors[glowColor]}40`
  } : {};

  return (
    <div 
      className={`bg-glass backdrop-blur-md border border-glass rounded-xl ${className}`}
      style={glowStyles}
    >
      {children}
    </div>
  );
};
