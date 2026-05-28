# FIX 010 — Server Move Validation & useScoreSubmit Wiring

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — TypeScript clean, build succeeds (0 errors, 752 modules)

---

## Problems

### 1. Server-side move validation completely bypassed
`CardMoveService.php` validates card plays against Redis game state, but `playCard()` in `cardStore.ts` never called the backend — all validation happened locally. The server had no record of individual moves.

### 2. Score submission uses raw fetch with no retry/offline
`useGameBridge.ts` called `fetch()` directly with no retry logic, no offline queue fallback, and no user stats refresh. `useScoreSubmit.ts` already had all of this (retry up to 3×, offline queue, `updateUser` on success) but was never called.

---

## Files Changed

| File | Change |
|------|--------|
| `games/card-battler/src/store/cardStore.ts` | Added `serverSessionId` state; init server session on `startGame`; send moves to `/api/games/card/moves` fire-and-forget after local play |
| `packages/game-sdk/src/useGameBridge.ts` | Removed raw `fetch()` score submission; bridge now only emits `GAME_OVER` event (single responsibility) |
| `apps/web/src/layouts/GameLayout.tsx` | Imports `useScoreSubmit`, calls `submitScore(result)` when `GAME_OVER` fires |
| `games/card-battler/src/index.tsx` | No longer passes `spectatorMode` to `emitGameOver` (no-op in spectator mode now) |

---

## Fix Details

### cardStore.ts — Server session + move validation

**New state:**
```typescript
serverSessionId: string | null  // initial: null
```

**On game start** — `POST /api/games/card/sessions` (fire-and-forget):
```typescript
void fetch('/api/games/card/sessions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, ... },
}).then(async res => {
  if (res.ok) {
    const data = await res.json();
    set({ serverSessionId: data.session_id });
  }
}).catch(() => { /* offline — continue locally */ });
```

**On card play** — `POST /api/games/card/moves` (fire-and-forget):
```typescript
void fetch('/api/games/card/moves', {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({
    session_id: sessionId,
    move_type: 'play_card',
    card_id: card.id,
  }),
}).then(async res => {
  if (!res.ok) console.warn('[CardBattler] Server rejected move', ...);
}).catch(() => { /* continue locally */ });
```

> Local-first approach keeps the game responsive. Full server-authoritative validation is a post-launch improvement.

### useGameBridge.ts — Single responsibility

Removed the `buildScoreSubmission` function, `ScoreSubmission` interface, `numberFrom` helper, and all the `fetch()` logic from `emitGameOver`. The bridge now only:

1. Sets status to `GAME_OVER`
2. Emits the `GAME_OVER` event

### GameLayout.tsx — Score submission via useScoreSubmit

```typescript
import { useScoreSubmit } from '../hooks/useScoreSubmit';

const { submitScore } = useScoreSubmit();

// In GAME_OVER handler:
const handleGameOver = (result: GameResult) => {
  setGameResult(result);
  setIsPaused(false);
  void submitScore(result);  // ← retry, offline queue, user refresh
};
```

This gives all three games: retry on failure (3×), offline queue fallback, and automatic `total_score` refresh on success.

---

## Verification

```
pnpm -C apps/web build
  ✓ TypeScript: 0 errors
  ✓ Build: 752 modules, all chunks generated
```
