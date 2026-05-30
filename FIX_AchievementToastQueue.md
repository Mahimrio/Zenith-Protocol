# FIX — Achievement Toast FIFO Queue

**Priority:** P1 — Real Problem
**Category:** C6 (UI/UX)

---

## Problem

`achievementStore.pendingToast` was a single slot (`AchievementToastItem | null`). When multiple achievements unlocked simultaneously (e.g. `first_game` + `first_blood` + `warlord` on first play), only the first toast would display. The remaining 2 were silently dropped because `unlockAchievement` overwrote `pendingToast`.

## Fix

### `apps/web/src/store/achievementStore.ts`

- Replaced `pendingToast: AchievementToastItem | null` with `toastQueue: AchievementToastItem[]` (FIFO array)
- `unlockAchievement` now pushes to the queue: `set(state => ({ toastQueue: [...state.toastQueue, data] }))`
- `clearToast` now shifts the first item off: `set(state => ({ toastQueue: state.toastQueue.slice(1) }))`

### `apps/web/src/components/AchievementToast.tsx`

- Changed from destructuring `{ pendingToast, clearToast }` to reading `s.toastQueue[0] ?? null` via a Zustand selector
- `clearToast` is acquired separately via its own selector (avoids full-store re-renders)
- GSAP animation logic unchanged — the `useEffect` dependency `currentToast` automatically triggers for each item in the queue

## How the queue works

1. `unlockAchievement("first_game")` → queue: `[A]`
2. `unlockAchievement("first_blood")` → queue: `[A, B]`
3. `unlockAchievement("warlord")` → queue: `[A, B, C]`
4. Toast reads `queue[0]` = A → shows GSAP animation → 3s → `clearToast()` → queue: `[B, C]`
5. React re-renders because `queue[0]` changed from `A` to `B` → shows B → ...and so on

## Verification

- ✅ `pnpm build` succeeds (752 modules, 0 errors)
- ✅ No `any` types or type errors
- ✅ FIFO semantics — all achievements will be displayed sequentially
