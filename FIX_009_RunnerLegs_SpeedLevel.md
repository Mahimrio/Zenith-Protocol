# FIX 009 — Runner Player Legs & speedLevel Moved to Store

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — TypeScript clean, build succeeds (0 errors, 751 modules)

---

## Problems

### 1. Player legs missing
The player rendered as a hovering rounded-rect + circle (head). No legs existed, making the character look incomplete.

### 2. speedLevel state in wrong place
`speedLevel` lived as local `useState` in `index.tsx`, passed via a prop callback `onGameSpeedUpdate`. This made it invisible to `runnerStore` consumers and cluttered the component hierarchy.

---

## Files Changed

| File | Change |
|------|--------|
| `games/cyber-runner/src/store/runnerStore.ts` | Added `speedLevel` state, `incrementSpeedLevel` action, reset in `startGame` |
| `games/cyber-runner/src/components/GameCanvas.tsx` | Removed `onGameSpeedUpdate` prop, uses store instead; added leg drawing with swing animation |
| `games/cyber-runner/src/index.tsx` | Removed local `useState` for speedLevel, reads from store; removed `useState` import |

---

## Fix Details

### runnerStore.ts — speedLevel

```typescript
// New state + actions
speedLevel: 1
incrementSpeedLevel: () => set((state) => ({ speedLevel: state.speedLevel + 1 }))

// Reset on game start
startGame: () => set({ ..., speedLevel: 1 })
```

### GameCanvas.tsx — Legs & store integration

**Leg drawing** (added after head, only when not sliding):
```typescript
if (!player.isSliding) {
  const legSwing = Math.sin(totalTime * 15) * 10;
  // Left leg
  ctx.moveTo(player.x + pWidth * 0.35, drawY + pHeight);
  ctx.lineTo(player.x + pWidth * 0.35 + legSwing, drawY + pHeight + 15);
  // Right leg (opposite swing)
  ctx.moveTo(player.x + pWidth * 0.65, drawY + pHeight);
  ctx.lineTo(player.x + pWidth * 0.65 - legSwing, drawY + pHeight + 15);
}
```

**Speed level** now calls store directly instead of prop:
```typescript
// BEFORE
onGameSpeedUpdate(Math.floor((gameSpeedRef.current - 280) / 15) + 1);

// AFTER
useRunnerStore.getState().incrementSpeedLevel();
```

### index.tsx — Cleaner

```typescript
// BEFORE
const [speedLevel, setSpeedLevel] = useState(1);
<GameCanvas onGameSpeedUpdate={setSpeedLevel} />

// AFTER
const { startGame, gameStatus, distance, obstaclesAvoided, speedLevel } = useRunnerStore();
<GameCanvas />
```

---

## Verification

```
pnpm -C apps/web build
  ✓ TypeScript: 0 errors
  ✓ Build: 751 modules, all chunks generated
```

---

## 🎉 All 15 audit bugs fixed
