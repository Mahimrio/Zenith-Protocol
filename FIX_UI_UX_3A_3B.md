# UI/UX Fix 3A & 3B — Loading screen game name + Score saved feedback

**Category:** UI/UX (P3)

---

## 3A — Loading screen shows game name

**Files:** `GlobalLoadingScreen.tsx`, `GameLayout.tsx`

**Problem:** The suspense fallback during game module loading only showed a generic "Loading module..." text. Users had no feedback about which game was loading.

**Fix:**
- Added optional `gameName?: string` prop to `GlobalLoadingScreen`
- Extracted `gameNames` mapping to module-level constant in `GameLayout.tsx`
- Pass `gameName` to `<GlobalLoadingScreen>` in the Suspense fallback
- Below the spinning ring, displays: "Loading Dojo Fighter..." (with animate-pulse) when `gameName` is provided

## 3B — Score submission success feedback in GameOverModal

**Files:** `GameLayout.tsx`, `GameOverModal.tsx`

**Problem:** When a player finishes a game, the score is submitted to the server but there's no visual confirmation that it was saved. Users might wonder if their score was actually recorded.

**Fix:**
- Added `scoreSaved` state in `GameLayout.tsx`
- `submitScore(result)` now chains `.then()` to set `scoreSaved = true`, auto-clearing after 3 seconds
- Passed `scoreSaved` as a prop to `GameOverModal`
- In `GameOverModal`, renders a green "✓ Score saved" message with GSAP fade-in when true (and .catch handles offline queue case gracefully)

## Verification

- ✅ `pnpm build` succeeds (752 modules, 0 errors)
- ✅ Loading screen shows game name during module load
- ✅ GameOverModal shows "Score saved" confirmation after successful submission
