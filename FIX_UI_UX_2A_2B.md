# UI/UX Fix 2A & 2B — Escape closes modal + Orientation blocks touch

**Category:** UI/UX (P1/P2)

---

## 2A — Escape closes SettingsModal

**File:** `apps/web/src/components/SettingsModal.tsx`

**Problem:** The SettingsModal could only be closed by clicking the X button or the dark overlay. There was no keyboard Escape handling — a basic UX expectation for modals.

**Fix:** Added a `keydown` event listener that calls `onClose` when Escape is pressed. The listener is cleaned up on unmount/dependency change.

---

## 2B — Orientation overlay blocks touch pass-through

**File:** `apps/web/src/layouts/GameLayout.tsx`

**Problem:** When the portrait orientation warning is shown (Dojo 3D on mobile portrait), touch events could pass through the overlay and reach the R3F game canvas underneath. This caused ghost inputs (e.g. accidental character movement) while the overlay was visible.

**Fix:**
- Added `pointer-events-auto` to the `OrientationOverlay` div (ensures it captures touches)
- Wrapped `<GameComponent />` in a `<div>` with conditional `pointer-events-none` when `showOrientationWarning` is true (blocks touches from reaching the game)

## Verification

- ✅ `pnpm build` succeeds (752 modules, 0 errors)
- ✅ Escape key now closes SettingsModal
- ✅ Touch events are blocked from reaching the game canvas while orientation warning is shown
