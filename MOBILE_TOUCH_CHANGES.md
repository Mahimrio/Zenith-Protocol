# Mobile Touch Optimization — Implementation Summary

> **Date:** 2026-05-19
> **Feature:** Mobile touch controls across all three games (Dojo 3D, Cyber Runner, Card Battler) + orientation warning.

---

## Overview

Adds native touch input for all three games on mobile devices (< 768px). Desktop keyboard controls remain unchanged. Touch controls use pointer events and custom virtual joystick (no external dependencies).

---

## New Files

### Shared (`packages/game-sdk`)

| File | Purpose |
|------|---------|
| `src/utils/device.ts` | `isTouchDevice()`, `isMobile()`, `useIsMobile()` hook with resize/orientation listeners. Barrel-exported from `@sdk/utils/device`. |

### Dojo 3D (`games/dojo-3d`)

| File | Purpose |
|------|---------|
| `src/hooks/useTouchController.ts` | Touch-driven input controller. Returns same interface as keyboard controller: `update()` returns `{ velocity, facing, attacking }`. Joystick vector + attack trigger via refs (no re-renders). |
| `src/components/VirtualJoystick.tsx` | Custom virtual joystick (no nipplejs dependency). 120px base, 48px knob, neon-cyan. Bottom-left. Pointer events with `setPointerCapture`. Outputs normalized `{x, y}` vector. Renders only on mobile. |
| `src/components/AttackButton.tsx` | 80px circular attack button, bottom-right. Coral/red themed. GSAP scale 1→1.2→1 on press (0.2s). 500ms cooldown. Renders only on mobile. |

### Cyber Runner (`games/cyber-runner`)

| File | Purpose |
|------|---------|
| `src/components/TouchControls.tsx` | Fullscreen invisible overlay (absolute, z-10). Left half → jump, right half → slide. Visual zone hints (arrows + labels) fade out after 2s on first 3 plays. `preventDefault` on all touch events to stop page scroll. Renders only on mobile. |

---

## Modified Files

### Dojo 3D

| File | Change |
|------|--------|
| `src/hooks/usePlayerController.ts` | Detects `useIsMobile()`. On mobile: reads from `joystickVector` ref + `touchAttackTrigger` ref (set by VirtualJoystick/AttackButton). On desktop: existing keyboard logic unchanged. Returns unified interface + `setJoystickVector`/`triggerTouchAttack` setters. |
| `src/components/HUD.tsx` | Added imports for VirtualJoystick, AttackButton, JoystickVector type. Added `handleJoystickMove` callback. Renders `<VirtualJoystick>` and `<AttackButton>` at bottom of HUD. |

### Cyber Runner

| File | Change |
|------|--------|
| `src/hooks/useInputHandler.ts` | Removed window-level touch listeners (replaced by TouchControls overlay). Keyboard logic preserved intact. `substr→slice` fix unaffected. Touch now handled by TouchControls calling `onJump`/`onSlide` directly. |
| `src/components/GameCanvas.tsx` | Added `<TouchControls onJump={jump} onSlide={slide} />` overlay. Canvas remains primary render target. |

### Card Battler

| File | Change |
|------|--------|
| `src/components/Card.tsx` | Replaced `onMouseEnter`/`onMouseLeave` with `onPointerEnter`/`onPointerLeave`. Added pointer drag-to-play: `pointerdown` records Y + `setPointerCapture`, `pointermove` translates card upward if `deltaY < -40`, `pointerup` triggers `onDragPlay()` if `deltaY < -80` else snaps back. Added `touch-none` class. New `onDragPlay` prop. |
| `src/components/PlayerHand.tsx` | Mobile: switches from fan layout → horizontal scroll row (`overflow-x: auto`, `snap-x snap-mandatory`, hidden scrollbar). Scroll hint arrows (‹ ›) on first interaction, auto-hide after 3s. Desktop: fan layout unchanged. Both modes wire `onDragPlay` for touch card play. |

### Web App

| File | Change |
|------|--------|
| `src/layouts/GameLayout.tsx` | Added `useIsMobile()` + portrait detection (`window.innerHeight > window.innerWidth`). If `isMobile && gameId === 'dojo-3d' && isPortrait`: shows `OrientationOverlay` — GlassCard with animated rotation icon (GSAP 90° yoyo loop), "Rotate Your Device" message. |
| `packages/game-sdk/src/index.ts` | Barrel export: `isTouchDevice`, `isMobile`, `useIsMobile` from `./utils/device`. |

---

## Key Design Decisions

1. **No nipplejs dependency** — Custom virtual joystick using pointer events avoids adding an external package. Simpler bundle, full control over styling.
2. **Unified controller interface** — `usePlayerController` returns same `update()` signature regardless of input method. Game loop code unchanged.
3. **TouchControls overlay (Cyber Runner)** — Replaced window-level touch listeners with a dedicated component. Prevents page scroll via `preventDefault` on the overlay only, not globally.
4. **Pointer Events (Card Battler)** — Unified mouse + touch via Pointer Events API. `setPointerCapture` ensures reliable drag tracking even if finger leaves the card element.
5. **DOM ref mutations for countdown** — Consistent with existing patterns (useDailyChallenges), avoids unnecessary React re-renders.
6. **Rapier compatibility** — Dojo 3D touch controls do not touch physics colliders. Existing `colliders={false}` + explicit CapsuleCollider/BallCollider pattern maintained.

---

## Verification

- Frontend build: 0 TypeScript errors, 0 vite errors
- Backend tests: 11/11 Pest tests passing
- All touch components render `null` on desktop (no DOM impact)
- Keyboard controls fully preserved on desktop
