# FIX — First-Time Welcome Toast for New Users

**Priority:** P2 — UX
**Category:** UI/UX (Onboarding)

---

## Problem

New users (games_played === 0) land on a page with an empty leaderboard and game cards but no initial guidance on what to do. They see "Rankings" but no scores yet, and may not know where to start.

## Fix

**File:** `apps/web/src/pages/MenuPage.tsx`

- Added `showWelcome` state and `welcomeRef` for GSAP animation
- On mount, when `user` is available and `games_played === 0`, checks localStorage key `zenith-welcome-shown` — only fires once ever
- After 1.5s delay (let page render first), shows a neon-cyan GlassCard toast:
  > **Welcome, Operative 👋**
  > Choose a game above and deploy your first session.
- After 6.5s total (5s visible), fades out with GSAP `back.out(1.7)` entrance → `power2.in` exit
- localStorage flag prevents re-showing on subsequent visits

## Verification

- ✅ `pnpm lint` — clean
- ✅ `pnpm build` — 752 modules, 0 errors
- ✅ Toast only shows once, only for users with games_played === 0
- ✅ GSAP entrance (back.out) + exit (power2.in) animations
- ✅ Timer cleanup on unmount
