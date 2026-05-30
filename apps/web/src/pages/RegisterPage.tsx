/**
 * @file RegisterPage.tsx
 * @description Cyberpunk-themed registration page matching LoginPage aesthetics.
 * Uses NeonGrid background, centered GlassCard, and GSAP error animations.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { GlassCard } from '@ui/GlassCard';
import { NeonButton } from '@ui/NeonButton';
import { NeonGrid } from '../components/NeonGrid';
import gsap from 'gsap';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorRef = useRef<HTMLDivElement>(null);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Create Account — Zenith Protocol' }, []);

  /** Animate the error banner in with GSAP */
  const showError = (message: string) => {
    setError(message);
    // Wait one tick for the DOM node to mount, then animate
    requestAnimationFrame(() => {
      if (errorRef.current) {
        gsap.fromTo(
          errorRef.current,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        );
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await register(name, email, password, passwordConfirmation);
      navigate('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Shared input classes (mirrors LoginPage) ───────────────── */
  const inputClasses =
    'w-full bg-black/40 border border-border-glass rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-neon-cyan transition-colors font-mono placeholder:text-text-muted/30';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <NeonGrid />

      {/* Radial vignette overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-transparent to-bg-primary/90 pointer-events-none" />

      <GlassCard
        glowColor="neon-cyan"
        className="w-full max-w-md p-10 z-10 mx-4 border-neon-cyan/20"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-xl bg-bg-primary border-2 border-neon-cyan shadow-[0_0_20px_#00f5ff80] flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-neon-cyan" style={{ textShadow: '0 0 8px #00f5ff' }}>Z</span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary tracking-[0.2em] uppercase">
            Zenith<span className="text-neon-cyan">Protocol</span>
          </h1>
          <p className="text-text-muted mt-2 font-mono text-sm">
            NEW OPERATIVE REGISTRATION
          </p>
        </div>

        {/* ── Form ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Callsign / Name */}
          <div>
            <label className="block text-xs font-mono text-neon-cyan uppercase mb-2 tracking-widest">
              Callsign
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Agent name"
              required
              maxLength={30}
            />
          </div>

          {/* Email / Identifier */}
          <div>
            <label className="block text-xs font-mono text-neon-cyan uppercase mb-2 tracking-widest">
              Identifier
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="user@zenith.node"
              required
            />
          </div>

          {/* Password / Encryption Key */}
          <div>
            <label className="block text-xs font-mono text-neon-cyan uppercase mb-2 tracking-widest">
              Encryption Key
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          {/* Confirm Password / Confirm Key */}
          <div>
            <label className="block text-xs font-mono text-neon-cyan uppercase mb-2 tracking-widest">
              Confirm Key
            </label>
            <input
              id="register-password-confirmation"
              type="password"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          {/* ── Error display (GSAP fade-in) ──────────────────── */}
          {error && (
            <div
              ref={errorRef}
              className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm font-mono text-center"
            >
              {error.toUpperCase()}
            </div>
          )}

          <NeonButton
            type="submit"
            variant="primary"
            className="w-full py-4 tracking-[0.3em] font-bold mt-4"
            loading={isLoading}
          >
            CREATE ACCOUNT
          </NeonButton>
        </form>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="mt-8 pt-8 border-t border-border-glass flex flex-col items-center gap-4">
          <p className="text-text-muted text-xs font-mono">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-neon-cyan hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
          <div className="flex gap-4">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse delay-75" />
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse delay-150" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
