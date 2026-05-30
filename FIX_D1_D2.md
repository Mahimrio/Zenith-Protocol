# FIX D1_D2 — HUD reactivity + Page titles

**Category:** C9 (TypeScript & Build Health) / C6 (UI/UX)

---

## D1 — HUD.tsx: Use destructured `wave` variable

**File:** `games/dojo-3d/src/components/HUD.tsx:57`

**Problem:** `useDojoStore.getState().wave` was called inline in the JSX render. This reads the store value at render time but doesn't establish a reactive subscription — the HUD would never re-render when `wave` changed.

**Fix:** Added `wave` to the existing `useDojoStore()` destructure (line 18 → `const { player, score, combo, wave, enemies } = useDojoStore()`) and replaced the `getState()` call with the reactive `{wave}` variable.

---

## D2 — Page title changes per route

**Files:**
- `apps/web/src/pages/MenuPage.tsx` → `document.title = 'Zenith Protocol'`
- `apps/web/src/pages/LoginPage.tsx` → `document.title = 'Sign In — Zenith Protocol'`
- `apps/web/src/pages/RegisterPage.tsx` → `document.title = 'Create Account — Zenith Protocol'`
- `apps/web/src/pages/ProfilePage.tsx` → `document.title = 'Profile — Zenith Protocol'`
- `apps/web/src/layouts/GameLayout.tsx` → `document.title = '{Game Name} — Zenith Protocol'` per `gameId`

**Problem:** All pages had the default Vite title. No `document.title` was set anywhere, so browser tabs all showed `Vite + React` and bookmarks had no context.

**Fix:** Added a `useEffect` to each page/layout that sets `document.title` on mount. LoginPage and RegisterPage also gained `useEffect` in their React import.

## Verification

- ✅ `pnpm build` succeeds (752 modules, 0 errors)
- ✅ HUD `wave` is now reactive — will re-render when store updates
- ✅ All 5 routes set appropriate `document.title`
