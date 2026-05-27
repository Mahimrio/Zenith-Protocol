# FIX 001 — GameOverModal & PauseMenu Mounting in GameLayout

> **Date:** 2026-05-27  
> **Type:** P0 Audit Bug Fix  
> **Status:** ✅ Resolved  
> **Related File:** `AGENTS.md` (updated)

---

## Problem

`GameOverModal` and `PauseMenu` existed as fully-implemented components but were **never imported or mounted** inside `GameLayout.tsx`. After a player died in any game, the screen froze on the last frame with no score summary, no restart button, and no way to navigate away. Pressing Escape also did nothing because the pause overlay was never rendered.

## Root Cause

`GameLayout.tsx` only rendered the active game component inside a `<Suspense>` boundary. It did not:

- Import `GameOverModal` or `PauseMenu`
- Subscribe to `gameBus` events (`GAME_OVER`, `PAUSE_REQUESTED`, `RESUME_REQUESTED`)
- Maintain any state to conditionally render those overlays

## Changes Applied

### 1. File Modified: `apps/web/src/layouts/GameLayout.tsx`

#### Imports Added
- `GameOverModal` from `../components/GameOverModal`
- `PauseMenu` from `../components/PauseMenu`
- `gameBus` from `@sdk/eventBus`
- `GameResult` type from `@sdk/types` (type-only import)

#### State Added
```ts
const [gameResult, setGameResult] = useState<GameResult | null>(null);
const [isPaused, setIsPaused] = useState(false);
```

#### `useEffect` — Event Bus Subscription
Subscribes to three `gameBus` events on mount and cleans up on unmount:

| Event | Action |
|-------|--------|
| `GAME_OVER` | `setGameResult(result)` + `setIsPaused(false)` |
| `PAUSE_REQUESTED` | `setIsPaused(true)` |
| `RESUME_REQUESTED` | `setIsPaused(false)` |

#### Handlers Added
- **`handlePlayAgain`** — Clears state, navigates to the same route with `replace: true`, then triggers `window.location.reload()` to force a full game remount.
- **`handleMenu`** — Clears state and navigates to `/`.
- **`handleResume`** — Sets `isPaused` to `false` and re-emits `RESUME_REQUESTED` to the bus so game modules can resume.

#### JSX Render Blocks Added
```tsx
{gameResult && (
  <GameOverModal result={gameResult} onPlayAgain={handlePlayAgain} onMenu={handleMenu} />
)}

{isPaused && (
  <PauseMenu onResume={handleResume} onRestart={handlePlayAgain} onMenu={handleMenu} />
)}
```

### 2. File Read-Only (Confirmed Compatibility)
- `apps/web/src/components/GameOverModal.tsx` — interface matches (`result`, `onPlayAgain`, `onMenu`)
- `apps/web/src/components/PauseMenu.tsx` — interface matches (`onResume`, `onRestart`, `onMenu`)

### 3. File Updated: `AGENTS.md`
- Component warning block changed from `⚠️ KNOWN BUG (unfixed)` to `✅ FIXED`
- `GameLayout` description updated to reflect modal / pause mounting
- Known bugs table row struck through and marked **FIXED**

## TypeScript & Build Verification

```bash
cd apps/web
pnpm exec tsc -b
# Result: (no output) — 0 errors, 0 warnings
```

## Architecture Notes

- **Type Safety:** `GameResult` is the discriminated union type from `@sdk/types`. `gameBus` is typed via `mitt<Events>`, so the handler signature `(result: GameResult)` is fully type-safe.
- **No `any` types:** All `useState` calls are explicit. No unused parameters were introduced.
- **Cleanup:** All `gameBus.on` calls have matching `gameBus.off` calls in the effect cleanup.
- **Force Reload:** `handlePlayAgain` intentionally uses `window.location.reload()` after `navigate(..., { replace: true })` because game modules may hold significant module-level state (e.g., Three.js scenes, physics worlds) that is safer to recreate from scratch than rely on React remount alone.

## Files Changed

| File | Action |
|------|--------|
| `apps/web/src/layouts/GameLayout.tsx` | Modified |
| `AGENTS.md` | Updated (bug status + description) |
| `FIX_001_GameLayout_GameOver_Pause.md` | Created (this file) |

---
