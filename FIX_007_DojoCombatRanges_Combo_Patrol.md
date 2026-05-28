# FIX 007 — Dojo Combat Ranges, Combo Threshold & Enemy Patrol

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — TypeScript clean, build succeeds (0 errors, 501 modules)

---

## Problems

| # | Bug | Spec | Actual |
|---|-----|------|--------|
| 1 | Player attack range | 1.5 | 2.0 (too forgiving) |
| 2 | Enemy attack range | 1.5 | 1.2 (too close) |
| 3 | Combo display threshold | 3+ kills | 2+ kills |
| 4 | Enemy speed scaling | `base × 1.1^(wave-1)` multiplicative | `2 + wave × 0.2` additive (wrong growth) |
| 5 | Enemy patrol behavior | Random wander when `dist >= 15` | Enemies freeze when far |

---

## Files Changed

| File | Change |
|------|--------|
| `games/dojo-3d/src/hooks/useCombat.ts` | Player attack range: `2.0` → `1.5` |
| `games/dojo-3d/src/hooks/useEnemyAI.ts` | Enemy attack range `1.2`→`1.5`, speed multiplicative scaling, added patrol wandering |
| `games/dojo-3d/src/components/HUD.tsx` | Combo display: `> 1` → `>= 3` |

---

## Fix Details

### useCombat.ts — Attack range

```typescript
const checkAttackHits = (attackPos: THREE.Vector3, range: number = 1.5) => {
```

### useEnemyAI.ts — Range, speed & patrol

```typescript
// Range: 1.2 → 1.5 for both chase threshold and attack threshold
if (dist < 15 && dist > 1.5) {  // CHASE
  ...
} else if (dist <= 1.5) {       // ATTACK
  ...
}

// Speed: additive → multiplicative 10% per wave
const baseSpeed = 2;
const speedMultiplier = Math.min(Math.pow(1.1, wave - 1), 10);  // cap at 10x
vel = ... multiplyScalar(baseSpeed * speedMultiplier);

// Patrol: random wandering when dist >= 15
const patrolTimer = useRef(0);
const patrolDir = useRef<THREE.Vector3>(new THREE.Vector3(1, 0, 0));

// Changes direction every 2 seconds
if (now - patrolTimer.current > 2000) {
  patrolDir.current = new THREE.Vector3(
    (Math.random() - 0.5) * 2, 0,
    (Math.random() - 0.5) * 2
  ).normalize();
}
vel.copy(patrolDir.current).multiplyScalar(1.0);
```

### HUD.tsx — Combo threshold

```typescript
// Display condition
{combo >= 3 && ( ... )}

// GSAP trigger
if (combo >= 3 && comboRef.current) { ... }
```

---

## Verification

```
pnpm -C apps/web build
  ✓ TypeScript: 0 errors
  ✓ Build: 501 modules, all chunks generated
```
