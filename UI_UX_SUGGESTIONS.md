# Zenith Protocol — UI/UX Improvement Suggestions

> **Date:** 2026-05-30
> **Based on:** Final comprehensive audit

---

| Priority | Suggestion | Effort | Current Behavior |
|----------|-----------|--------|-----------------|
| **P0** | Add actual sound files or remove dead sound hooks | Low | All 4 sound dirs are `.gitkeep` placeholders — audio layer is completely silent |
| **P1** | Stack achievement toasts (queue vs single slot) | Low | `pendingToast` is single-slot — 3 simultaneous unlocks show only 1 |
| **P1** | Escape closes SettingsModal | Very low | Only X button and backdrop close work; Escape is ignored |
| **P1** | Block touch behind orientation overlay | Very low | Game component beneath still receives pointer events through the overlay |
| **P2** | Loading screen shows game name | Very low | `GlobalLoadingScreen` is a generic spinning ring with no context |
| **P2** | Score submission success feedback | Low | No toast, no flash, no checkmark after score submits |
| **P2** | Keyboard shortcut hint on first play | Low | Escape → Pause must be discovered by trial |
| **P3** | Drag-to-play ghost preview (Card Battler) | Medium | No visual feedback during card drag — no ghost, no zone highlight |
| **P3** | Welcome toast for new users | Low | Fresh user sees empty leaderboard but no "Play your first game!" prompt |
| **P3** | Back arrow in game navbar | Low | User must Pause → Abort to Menu (2 clicks) instead of 1 back button |

---

## Details

### P0 — Sound files are missing

All 4 sound directories contain only `.gitkeep`:
- `apps/web/public/sounds/dojo/`
- `apps/web/public/sounds/runner/`
- `apps/web/public/sounds/card/`
- `apps/web/public/sounds/ui/`

Every `playSfx()` call and `Howl` construction fires silently. Sound hooks (`useSound`, `useMusic`, `playSfx`) are wired end-to-end but produce zero audio output.

**Fix:** Add MP3 files, or at minimum add a console.warn when a Howl src is missing so devs know why audio is silent.

---

### P1 — Achievement toast queue is single-slot

`achievementStore.ts:48`:
```ts
pendingToast: AchievementToastItem | null;
```

If `CheckAchievements` evaluates 3 newly-unlocked achievements, `unlockAchievement()` is called 3 times. The first sets `pendingToast`, and the subsequent 2 are silently dropped because `unlockAchievement` checks `if (unlocked.has(data.slug)) return` — but only after already being refused. The toasts never appear.

**Fix:** Change to a FIFO queue:
```ts
pendingQueue: AchievementToastItem[];
```
Show one, shift next on `clearToast()`.

---

### P1 — Escape doesn't close SettingsModal

`SettingsModal.tsx` has no global keydown listener. Users expect Escape to close modal dialogs.

**Fix:** Add to `SettingsModal.tsx`:
```tsx
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) onClose();
  };
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [isOpen, onClose]);
```

---

### P1 — Orientation overlay doesn't block touch pass-through

`GameLayout.tsx:111-136`: The `OrientationOverlay` renders on top after `GameComponent`. But the game R3F canvas beneath still receives `pointermove`/`touchmove` events through the `bg-black/70` overlay.

**Fix:** Either add `pointer-events-none` on the game container conditionally, or add `pointer-events-auto` to the overlay's wrapping div along with the full absolute inset.

---

### P2 — Loading screen is an anonymous spinner

`GlobalLoadingScreen` shows a spinning ring with no text. On a slow connection, the user sees a ring but doesn't know which game is loading.

**Fix:** Add a `gameName` prop:
```tsx
interface GlobalLoadingScreenProps {
  gameName?: string;
}
```
Display it below the ring: "Loading {gameName}..."

---

### P2 — No feedback after score submit

After `submitScore` completes in `GameLayout.tsx:55`, there's no visual acknowledgement. User has to check the leaderboard later.

**Fix:** Add a brief GSAP flash on the GameOverModal score number, or show a small green checkmark + "Score saved" text for 1.5s.

---

### P2 — Keyboard shortcuts are invisible

Escape → Pause works for all 3 games. No UI tells the user this. On first play, most users won't know they can pause.

**Fix:** Show a dimmed "Press `Esc` to pause" overlay for the first 3 seconds of gameplay (then fade out via GSAP). Or add a small `[?]` icon in the game HUD that reveals shortcuts.

---

### P3 — Card Battler drag-to-play has no ghost preview

Per AGENTS.md, Card Battler uses Pointer Events for drag-to-play. The player has no visual indicator of where the card will land during the drag — no semi-transparent ghost card following the pointer, no board zone highlight.

**Fix:** While dragging, clone the card element, set `opacity: 0.5`, `pointer-events: none`, and sync its position to the pointer via `onPointerMove`. Highlight valid play zones (`enemyBoard` area for attack cards) with a colored border.

---

### P3 — New users get no onboarding

After registering and logging in, a user with `games_played === 0` sees the main menu with GameGrid, Daily Challenges, and an empty leaderboard. No prompt directs them to play their first game.

**Fix:** On first login where `games_played === 0`, show a gentle welcome toast:
```
Welcome, Operative. Deploy your first game above.
```
Dismiss after 5 seconds or on click. Only shows once (track via localStorage flag).

---

### P3 — Navbar lacks back-to-menu arrow during gameplay

When inside a game, the Navbar shows the pause button, score, and settings gear. There's no "back" button. Exiting to menu currently requires: click Pause → click Abort to Menu (2 clicks + a modal).

**Fix:** Add a subtle back arrow (`←`) next to the breadcrumb with a confirmation dialog:
```tsx
{activeGame && (
  <button onClick={confirmExit} className="text-text-muted hover:text-neon-cyan ...">
    <svg ...>back arrow</svg>
  </button>
)}
```
