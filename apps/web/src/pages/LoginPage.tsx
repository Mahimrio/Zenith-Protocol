/**
 * @file LoginPage.tsx
 * @description Sleek neon-themed login page.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '@ui/GlassCard';
import { NeonButton } from '@ui/NeonButton';
import { NeonGrid } from '../components/NeonGrid';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Sign In — Zenith Protocol' }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      login(data.user, data.token);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <NeonGrid />
      
      <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-transparent to-bg-primary/90 pointer-events-none" />

      <GlassCard glowColor="neon-cyan" className="w-full max-w-md p-10 z-10 mx-4 border-neon-cyan/20">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-xl bg-bg-primary border-2 border-neon-cyan shadow-[0_0_20px_#00f5ff80] flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-neon-cyan" style={{ textShadow: '0 0 8px #00f5ff' }}>Z</span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary tracking-[0.2em] uppercase">
            Zenith<span className="text-neon-cyan">Protocol</span>
          </h1>
          <p className="text-text-muted mt-2 font-mono text-sm">ACCESS PROTOCOL REQUIRED</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-neon-cyan uppercase mb-2 tracking-widest">Identifier</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-border-glass rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-neon-cyan transition-colors font-mono placeholder:text-text-muted/30"
              placeholder="user@zenith.node"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neon-cyan uppercase mb-2 tracking-widest">Encryption Key</label>
            <input 
              type="password" 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-border-glass rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-neon-cyan transition-colors font-mono placeholder:text-text-muted/30"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm font-mono text-center">
              {error.toUpperCase()}
            </div>
          )}

          <NeonButton 
            type="submit" 
            variant="primary" 
            className="w-full py-4 tracking-[0.3em] font-bold mt-4"
            loading={isLoading}
          >
            INITIATE LINK
          </NeonButton>
        </form>

        <div className="mt-8 pt-8 border-t border-border-glass flex flex-col items-center gap-4">
          <p className="text-text-muted text-xs font-mono">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-neon-cyan hover:underline transition-colors"
            >
              Register
            </Link>
          </p>
          <p className="text-text-muted text-xs font-mono">AUTHORIZED PERSONNEL ONLY</p>
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
