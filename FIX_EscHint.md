# FIX — Escape-to-Pause Hint for New Players

**Priority:** P2 — UX Discovery
**Category:** UI/UX

---

## Problem

Players had no way to know the Escape key pauses the game. The PauseMenu existed (subscribed to `PAUSE_REQUESTED`) but there was no discoverability — users had to press Esc by accident.

## Fix

**File:** `apps/web/src/layouts/GameLayout.tsx`

- Added `[showEscHint, setShowEscHint]` state and `hintRef`
- On mount, checks localStorage key `zenith-play-count`
- Only shown for first 3 plays (persisted via localStorage)
- Hidden on mobile (no physical keyboard)
- Hint appears at bottom-center of game screen:
  > Press **Esc** to pause
- After 3 seconds, hint fades out with GSAP (`opacity: 0` over 1s, `power2.in`)
- Timer and animation are properly cleaned up on unmount

## Verification

- ✅ `pnpm build` succeeds (752 modules, 0 errors)
- ✅ Hint shows on first 3 plays for desktop users
- ✅ Hint fades out after 3s with GSAP
- ✅ localStorage persists play count across sessions
- ✅ Mobile users never see the hint (no Esc key)
