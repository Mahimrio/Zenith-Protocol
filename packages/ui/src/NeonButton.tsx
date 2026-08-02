/**
 * @file NeonButton.tsx
 * @description A button with GSAP scale animation and neon variants.
 */
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = buttonRef.current;
    return () => {
      if (el) gsap.killTweensOf(el);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      gsap.to(buttonRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !loading) {
      gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }
  };

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      gsap.to(buttonRef.current, { scale: 0.95, duration: 0.1, ease: 'power2.out' });
    }
  };

  const handleMouseUp = () => {
    if (!disabled && !loading) {
      gsap.to(buttonRef.current, { scale: 1.05, duration: 0.1, ease: 'power2.out' });
    }
  };

  const baseStyles = 'relative rounded-xl font-medium transition-colors flex items-center justify-center focus:outline-none';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantStyles = {
    primary: 'bg-neon-cyan text-bg-primary shadow-[0_0_8px_#00f5ff,0_0_24px_#00f5ff40] hover:bg-opacity-90',
    ghost: 'bg-glass backdrop-blur-md border border-glass text-text-primary hover:bg-white/10',
    danger: 'bg-red-500 text-white shadow-[0_0_8px_#ef4444,0_0_24px_#ef444440] hover:bg-red-600'
  };

  const stateClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${stateClasses} ${className}`}
      {...props}
    >
      {loading ? <span className="animate-spin mr-2 border-2 border-current border-t-transparent rounded-full w-4 h-4" /> : null}
      {children}
    </button>
  );
};
