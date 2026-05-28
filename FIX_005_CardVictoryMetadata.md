# FIX 005 — Card Battler Victory Bonus & Score Formula

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — TypeScript clean, build succeeds (0 errors, 501 modules)

---

## Problems

### 1. Victory gives same score as defeat
The store had no `isVictory` flag. Both player death and enemy death set `gameStatus` to `GAME_OVER` with no distinction, so the +500 victory bonus was never applied.

### 2. Score formula used wrong multipliers
The actual score was calculated as `(card.cost × 10 per play) + (turnsSurvived × 50)`, but the spec calls for:

```
finalScore = (turnsSurvived × 100) + (cardsPlayed × 25) + (500 if victory)
```

---

## Files Changed

| File | Change |
|------|--------|
| `packages/game-sdk/src/types.ts` | Added `finalEnemyHp?: number` to `CardBattlerMetadata` |
| `games/card-battler/src/store/cardStore.ts` | Added `isVictory` state; set true on enemy death, false on player death |
| `games/card-battler/src/index.tsx` | Replaced wrong formula with spec-correct formula using `getState()` |

---

## Fix Details

### cardStore.ts — `isVictory` tracking

```typescript
// New state field
isVictory: boolean  // initial: false

// In takeDamage:
if (target === 'player' && hp === 0) {
  isVictory: false
}
if (target === 'enemy' && hp === 0) {
  isVictory: true
}
```

### index.tsx — Correct score formula

```typescript
const finalScore = (state.turnsSurvived * 100)
  + (state.cardsPlayed * 25)
  + (state.isVictory ? 500 : 0);
```

Metadata now also includes `finalEnemyHp` for richer session history.

---

## Verification

```
pnpm -C apps/web build
  ✓ TypeScript: 0 errors
  ✓ Build: 501 modules, all chunks generated
```
