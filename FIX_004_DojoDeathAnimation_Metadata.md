# FIX 004 — Dojo Enemy Death Animation & Score Metadata

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — TypeScript clean, build succeeds (0 errors, 501 modules)

---

## Problems

### 1. Enemy death has no animation
Enemies disappeared instantly when killed. No visual feedback.

### 2. enemiesKilled not tracked as real counter
The store had no dedicated `enemiesKilled` counter. Score submission used `Math.floor(score / 150)` — a hacky estimate that sent wrong data to the backend.

### 3. maxCombo never included in metadata
The `maxCombo` value was never tracked or included in the `emitGameOver` payload, so the backend always received 0.

---

## Files Changed

| File | Change |
|------|--------|
| `games/dojo-3d/src/store/dojoStore.ts` | Added `enemiesKilled`, `maxCombo`, `dyingEnemyIds` state + `markEnemyDying` action |
| `games/dojo-3d/src/components/Enemy.tsx` | GSAP shrink-to-zero animation on death, wrapped mesh in `<group>` for scale anim |
| `games/dojo-3d/src/hooks/useCombat.ts` | `killEnemy(enemy.id)` → `markEnemyDying(enemy.id)` |
| `games/dojo-3d/src/index.tsx` | Metadata now includes real `enemiesKilled` + `maxCombo`; removed hacky `Math.floor(score / 150)` |

---

## Fix Details

### dojoStore.ts — New state & actions

```typescript
// New state fields
enemiesKilled: 0
maxCombo: 0
dyingEnemyIds: []

// New action — marks enemy for death animation
markEnemyDying: (id) => set((state) => ({
  dyingEnemyIds: [...state.dyingEnemyIds, id]
}))

// Modified killEnemy — now also:
killEnemy: (id) => set((state) => {
  // ...existing score/combo logic...
  return {
    // ...existing...
    enemiesKilled: state.enemiesKilled + 1,
    maxCombo: Math.max(state.maxCombo, newCombo),
    dyingEnemyIds: state.dyingEnemyIds.filter(did => did !== id)
  };
}),
```

### Enemy.tsx — GSAP death animation

The component subscribes to `dyingEnemyIds`, and when its ID appears:
1. Disables the Rapier rigid body (stops physics)
2. GSAP animates the group scale to zero (0.3s, `power2.in`)
3. On complete, calls `killEnemy(id)` to remove from store

The mesh is now wrapped in a `<group>` so scaling the group doesn't interfere with Rapier's physics body.

### useCombat.ts — Trigger animation instead of instant removal

```typescript
// BEFORE
killEnemy(enemy.id);
// AFTER
markEnemyDying(enemy.id);
```

### index.tsx — Real metadata

```typescript
// BEFORE (hacky estimate)
enemiesKilled: Math.floor(score / 150)

// AFTER (real values)
enemiesKilled,  // from store
maxCombo,       // from store
```

---

## Verification

```
pnpm -C apps/web build
  ✓ TypeScript: 0 errors
  ✓ Build: 501 modules, all chunks generated
```
