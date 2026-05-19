/**
 * @file DailyChallengeBanner.tsx
 * @description Horizontal banner displaying today's 3 daily challenges.
 *
 * Features:
 *  - Left: "DAILY CHALLENGES" title + countdown timer
 *  - Center: 3 ChallengeCard components (stack on mobile)
 *  - Right: points earned today
 *  - GSAP slide-down entrance on mount (0.5s delay)
 *  - Mobile: collapsible via GSAP height animation on tap
 */
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useDailyChallenges } from '../hooks/useDailyChallenges';
import { ChallengeCard } from './ChallengeCard';

/**
 * Daily challenges banner — shown below Navbar on MenuPage.
 */
export const DailyChallengeBanner: React.FC = () => {
  const { challenges, totalEarnedToday, countdownRef } = useDailyChallenges();
  const bannerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLSpanElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  /* ── Entrance animation ─────────────────────────────────────────── */
  useEffect(() => {
    if (bannerRef.current) {
      gsap.fromTo(
        bannerRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  /* ── Collapse/expand on mobile ──────────────────────────────────── */
  const toggleCollapse = () => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    const chevron = chevronRef.current;
    if (!wrapper || !content || !chevron) return;

    if (collapsed) {
      const naturalHeight = content.scrollHeight;
      gsap.to(wrapper, {
        height: naturalHeight,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(chevron, { rotation: 180, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(wrapper, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
      gsap.to(chevron, { rotation: 0, duration: 0.3, ease: 'power2.out' });
    }

    setCollapsed(!collapsed);
  };

  if (challenges.length === 0) return null;

  return (
    <div
      ref={bannerRef}
      className="w-full max-w-6xl mx-auto px-6 mb-6"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2
            className="text-sm font-bold text-neon-amber tracking-widest uppercase"
            style={{ textShadow: '0 0 8px rgba(245, 158, 11, 0.3)' }}
          >
            Daily Challenges
          </h2>
          <span className="text-xs font-mono text-text-muted">
            Resets in <span ref={countdownRef} className="text-neon-cyan">--:--:--</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">Earned today:</span>
          <span
            className="text-sm font-bold text-neon-amber"
            style={{ textShadow: '0 0 6px #f59e0b80' }}
          >
            {totalEarnedToday} pts
          </span>
          {/* Mobile chevron */}
          <button
            onClick={toggleCollapse}
            className="md:hidden p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <span
              ref={chevronRef}
              className="block"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Collapsible wrapper */}
      <div
        ref={wrapperRef}
        className="overflow-hidden md:overflow-visible"
        style={{ height: 'auto', opacity: 1 }}
      >
        <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </div>
    </div>
  );
};
