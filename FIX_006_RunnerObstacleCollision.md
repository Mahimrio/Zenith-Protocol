# FIX 006 — Runner Obstacle Avoidance Tracking & Forgiving Hitbox

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — TypeScript clean, build succeeds (0 errors, 501 modules)

---

## Problems

### 1. obstaclesAvoided always submitted as 0
The store had no counter for avoided obstacles. The game-over payload always sent 0.

### 2. No 80% inner hitbox — too punishing
Collision used the full visual bounding box. Near-misses (pixel touching the edge) killed the player, making the game feel unfair.

---

## Files Changed

| File | Change |
|------|--------|
| `games/cyber-runner/src/store/runnerStore.ts` | Added `obstaclesAvoided` state + `incrementObstaclesAvoided()` action |
| `games/cyber-runner/src/hooks/useObstacles.ts` | Calls `incrementObstaclesAvoided()` when obstacle exits left edge |
| `games/cyber-runner/src/index.tsx` | Includes `obstaclesAvoided` in game-over metadata |
| `games/cyber-runner/src/utils/collision.ts` | Added `checkPlayerObstacleCollision()` with 80% inner hitbox |
| `games/cyber-runner/src/components/GameCanvas.tsx` | Uses new forgiving collision function |

---

## Fix Details

### runnerStore.ts — New counter

```typescript
obstaclesAvoided: 0

// Reset on start
startGame: () => set({ distance: 0, gameStatus: GameStatus.PLAYING, obstaclesAvoided: 0 })

// Incremented each time an obstacle exits safely
incrementObstaclesAvoided: () => set((state) => ({
  obstaclesAvoided: state.obstaclesAvoided + 1
}))
```

### useObstacles.ts — Track avoidance on cull

```typescript
if (obstacles.current[i].x < -100) {
  useRunnerStore.getState().incrementObstaclesAvoided();
  obstacles.current.splice(i, 1);
}
```

### collision.ts — 80% inner hitbox

```typescript
export const checkPlayerObstacleCollision = (
  player: Bounds, obstacle: Bounds, isSliding: boolean
): boolean => {
  // Shrink player hitbox to 80% for forgiving feel
  const innerFactor = 0.8;
  const widthInset = player.w * (1 - innerFactor) / 2;
  // Sliding: 50% height; normal: 80% height
  const heightFactor = isSliding ? 0.5 : innerFactor;
  const heightInset = player.h * (1 - heightFactor) / 2;

  const innerPlayer: Bounds = {
    x: player.x + widthInset,
    y: player.y + heightInset,
    w: player.w * innerFactor,
    h: player.h * heightFactor,
  };

  return aabbCollides(innerPlayer, obstacle);
};
```

### GameCanvas.tsx — Use forgiving collision

```typescript
// BEFORE
if (aabbCollides(pHitbox, oHitbox)) { ... }

// AFTER
if (checkPlayerObstacleCollision(pHitbox, oHitbox, player.isSliding)) { ... }
```

---

## Verification

```
pnpm -C apps/web build
  ✓ TypeScript: 0 errors
  ✓ Build: 501 modules, all chunks generated
```
