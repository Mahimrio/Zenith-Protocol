# FIX 008 — Dojo Motion Trail & Impact Particle Position

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — TypeScript clean, build succeeds (0 errors, 751 modules)

---

## Problems

### 1. ImpactParticles always spawn at world origin
`ImpactParticles.tsx` hardcoded `position={[0, 2, 0]}`, so the particle burst always appeared at the arena center rather than where the enemy was hit.

### 2. Player motion trail missing
No trailing effect existed behind the player. Movement felt static with no sense of speed or direction.

---

## Files Changed

| File | Change |
|------|--------|
| `games/dojo-3d/src/store/dojoStore.ts` | Added `lastHitPosition` state; `killEnemy` now stores the killed enemy's position |
| `games/dojo-3d/src/components/ImpactParticles.tsx` | Reads `lastHitPosition` from store instead of hardcoded `[0, 2, 0]` |
| `games/dojo-3d/src/components/Player.tsx` | Wrapped body mesh in `<Trail>` from `@react-three/drei` |

---

## Fix Details

### dojoStore.ts — Track last hit position

```typescript
// New state
lastHitPosition: [number, number, number]  // initial: [0, 1, 0]

// In killEnemy:
killEnemy: (id) => set((state) => {
  const enemy = state.enemies.find(e => e.id === id);
  // ...
  return {
    // ...
    lastHitPosition: enemy.position
  };
}),
```

### ImpactParticles.tsx — Use store position

```typescript
// BEFORE
<points ref={particlesRef} position={[0, 2, 0]}>

// AFTER
<points ref={particlesRef} position={lastHitPosition}>
```

### Player.tsx — Add motion trail

Wrapped the body mesh in `@react-three/drei`'s `Trail` component:

```typescript
import { Trail } from '@react-three/drei';

// Inside the group:
<group ref={groupRef}>
  <Trail
    width={1.5}
    length={6}
    color="#00f5ff"
    attenuation={(t: number) => t * t}
    decay={1}
  >
    <mesh castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial ... />
    </mesh>
  </Trail>
  <mesh ref={fistRef} ... />
</group>
```

The `Trail` wraps only the body capsule (not the fist or the RigidBody), creating a neon-cyan fading trail that follows the player's movement.

---

## Verification

```
pnpm -C apps/web build
  ✓ TypeScript: 0 errors
  ✓ Build: 751 modules, all chunks generated
```
