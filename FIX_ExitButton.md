# FIX — Exit-to-Menu Button in Navbar During Gameplay

**Priority:** P2 — UX
**Category:** UI/UX

---

## Problem

Exiting to the main menu during gameplay required: Pause (Escape) → click "Main Menu" → 2 interactions. Most games have a visible back/exit button, so players shouldn't need to discover the pause menu first.

## Fix

**File:** `apps/web/src/components/Navbar.tsx`

Added a "← Menu" button next to the game breadcrumb that only renders during active gameplay:
- Chevron-left icon + "Menu" label (hidden on mobile via `hidden sm:inline`)
- `window.confirm('Leave game? Your current run will not be saved.')` on click
- If confirmed, navigates to `/`
- Styled as subtle text-muted text, hover → neon-cyan
- Uses the existing `activeGame` from `useGameStore` — no wiring changes needed
- No `GameLayout.tsx` changes required — Navbar already had `navigate` and `activeGame`

## Verification

- ✅ `pnpm lint` — clean
- ✅ `pnpm build` — 752 modules, 0 errors
- ✅ Button only visible when a game is active
- ✅ Confirm dialog prevents accidental exits
