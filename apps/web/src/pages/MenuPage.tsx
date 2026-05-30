/**
 * @file MenuPage.tsx
 * @description Main menu page with animated title, game grid,
 * and collapsible real-time leaderboard rankings section.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { NeonGrid } from '../components/NeonGrid';
import { GameGrid } from '../components/GameGrid';
import { Leaderboard } from '../components/Leaderboard';
import { DailyChallengeBanner } from '../components/DailyChallengeBanner';
import { NeonButton } from '@ui/NeonButton';
import { GlassCard } from '@ui/GlassCard';
import { useNavigate } from 'react-router-dom';

/**
 * Main menu page — hub for game selection and live leaderboards.
 *
 * Renders:
 *  - Animated "ZENITH PROTOCOL" title with staggered letter entrance
 *  - GameGrid for game selection
 *  - Collapsible "RANKINGS" section with GSAP height animation
 *  - User info footer with logout
 */
export const MenuPage: React.FC = () => {
  const { registeredGames } = useGameStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);

  /* ── Rankings collapse state ────────────────────────────────────── */
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const rankingsContentRef = useRef<HTMLDivElement>(null);
  const rankingsWrapperRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLSpanElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);

  /* ── Title letter animation ─────────────────────────────────────── */
  useEffect(() => {
    if (titleRef.current) {
      const letters = titleRef.current.children;
      gsap.fromTo(
        letters,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out'
        }
      );
    }
  }, []);

  useEffect(() => { document.title = 'Zenith Protocol' }, []);

  /* ── Welcome toast for first-time users ────────────────────────── */
  useEffect(() => {
    if (!user) return;
    if (user.games_played === 0) {
      const shown = localStorage.getItem('zenith-welcome-shown');
      if (!shown) {
        localStorage.setItem('zenith-welcome-shown', 'true');
        const showTimer = setTimeout(() => setShowWelcome(true), 1500);
        const hideTimer = setTimeout(() => setShowWelcome(false), 6500);
        return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
      }
    }
  }, [user]);

  /* ── GSAP welcome entrance/exit ────────────────────────────────── */
  useEffect(() => {
    if (!welcomeRef.current) return;
    if (showWelcome) {
      gsap.fromTo(welcomeRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      );
    } else {
      gsap.to(welcomeRef.current,
        { y: -100, opacity: 0, duration: 0.4, ease: 'power2.in' },
      );
    }
  }, [showWelcome]);

  const titleText = "ZENITH PROTOCOL".split('');

  /* ── Rankings expand/collapse animation ─────────────────────────── */
  const toggleRankings = useCallback(() => {
    const wrapper = rankingsWrapperRef.current;
    const content = rankingsContentRef.current;
    const chevron = chevronRef.current;
    if (!wrapper || !content || !chevron) return;

    if (rankingsOpen) {
      // Collapse
      gsap.to(wrapper, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
      gsap.to(chevron, { rotation: 0, duration: 0.3, ease: 'power2.out' });
    } else {
      // Expand — measure natural height then animate to it
      const naturalHeight = content.scrollHeight;
      gsap.to(wrapper, {
        height: naturalHeight,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(chevron, { rotation: 180, duration: 0.3, ease: 'power2.out' });
    }

    setRankingsOpen(!rankingsOpen);
  }, [rankingsOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center z-10 w-full pt-10 pb-20">
      <NeonGrid />
      <div className="flex-1 w-full max-w-6xl px-6 flex flex-col items-center">
        <div className="text-center mb-12 mt-8">
          <h1 ref={titleRef} className="text-6xl font-bold text-neon-cyan mb-4 tracking-widest" style={{ textShadow: '0 0 12px #00f5ff80' }}>
            {titleText.map((char, index) => (
              <span key={index} className="inline-block">{char === ' ' ? '\u00A0' : char}</span>
            ))}
          </h1>
          <p className="text-neon-purple italic text-xl font-medium" style={{ textShadow: '0 0 8px #8b5cf680' }}>
            Choose your arena
          </p>
        </div>

        <GameGrid games={registeredGames} />

        {/* ── Daily Challenges Banner ─────────────────────────────── */}
        <DailyChallengeBanner />

        {/* ── Rankings Section (collapsible) ──────────────────────── */}
        <div className="w-full mt-16">
          <button
            onClick={toggleRankings}
            className="
              w-full flex items-center justify-between px-4 py-3
              rounded-xl bg-glass border border-border-glass
              hover:bg-white/[0.06] transition-colors duration-200
              cursor-pointer group
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg bg-neon-amber/10 border border-neon-amber/30
                           flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-neon-amber"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2
                className="text-base font-bold text-text-primary tracking-widest uppercase"
                style={{ textShadow: '0 0 8px rgba(245, 158, 11, 0.3)' }}
              >
                Rankings
              </h2>
              {/* Live badge */}
              <span className="px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-[10px] font-bold uppercase tracking-wider">
                Live
              </span>
            </div>
            {/* Chevron */}
            <span
              ref={chevronRef}
              className="text-text-muted group-hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {/* Collapsible wrapper — height animated by GSAP */}
          <div
            ref={rankingsWrapperRef}
            className="overflow-hidden"
            style={{ height: 0, opacity: 0 }}
          >
            <div ref={rankingsContentRef} className="pt-4">
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>

      {/* ── Welcome toast for first-time users ──────────────────── */}
      {showWelcome && (
        <div ref={welcomeRef} className="fixed top-6 right-6 z-50 max-w-xs">
          <GlassCard glowColor="neon-cyan" className="p-4">
            <p className="text-text-primary font-bold text-sm">
              Welcome, Operative 👋
            </p>
            <p className="text-text-muted text-xs mt-1">
              Choose a game above and deploy your first session.
            </p>
          </GlassCard>
        </div>
      )}

      <footer className="fixed bottom-0 w-full h-16 bg-bg-secondary/80 backdrop-blur-md border-t border-border-glass flex items-center justify-between px-8 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-glass border border-neon-cyan overflow-hidden flex items-center justify-center shadow-[0_0_8px_#00f5ff40]">
            <span className="text-neon-cyan font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-text-primary">{user?.name || 'Guest User'}</span>
            <span className="text-xs text-text-muted font-mono">Total Score: {user?.total_score?.toLocaleString() || '0'}</span>
          </div>
        </div>
        <NeonButton variant="ghost" size="sm" onClick={handleLogout}>
          LOGOUT
        </NeonButton>
      </footer>
    </div>
  );
};
