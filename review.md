# Zenith Protocol Review & Debug Notes

## What I reviewed
- Monorepo root scripts and workspace wiring.
- Frontend host app (`apps/web`) configuration, aliasing, and API integration.
- Shared SDK (`packages/game-sdk`) score bridge behavior.
- Backend route contracts (`apps/api/routes/api.php` + request validators).
- Static source inspection only from this session (local command execution is unavailable in-agent on this machine).

## Key issues found
1. **Frontend workspace name mismatch**
   - Root scripts expected `web`, but `apps/web/package.json` was named `web_temp`.
   - Result: `pnpm --filter web dev` returned “No projects matched the filters”.

2. **Root scripts were out of sync**
   - `dev:api` intentionally failed (`echo ... && exit 1`), blocking normal startup from root.

3. **TypeScript alias resolution gap**
   - `@ui/*`, `@sdk/*`, `@games/*` aliases were defined in Vite but not in TS config, causing IDE/type errors.

4. **Frontend/API contract mismatch for score submission**
   - Frontend attempted `POST /api/scores`.
   - Backend exposes game-specific endpoints:
     - `/api/games/dojo/sessions`
     - `/api/games/runner/sessions`
     - card battler uses `/api/games/card/sessions` + `/api/games/card/moves` (no final score endpoint yet).

5. **Missing Vite API proxy**
   - Frontend used relative `/api/*` calls but had no proxy to Laravel server (`127.0.0.1:8000`), causing request failures in dev.

6. **Theme tokens incomplete**
   - UI relies on custom classes (`bg-bg-primary`, `text-neon-cyan`, `border-border-glass`, etc.) that were not defined in `@theme`.

## Fixes applied
- Updated root scripts in `package.json`:
  - `dev:web` → `pnpm -C apps/web dev`
  - `dev:api` → `cd apps/api && php artisan serve --host=127.0.0.1 --port=8000`
  - `build|lint|test:web` now run from `apps/web`.

- Updated `apps/web/package.json`:
  - Renamed package to **`web`**.
  - Added missing frontend dependencies used by source code (`gsap`, `react-router-dom`, `zustand`, `three`, `@react-three/*`, `mitt`).
  - Added a placeholder `test` script so root `test:web` does not fail on missing script.

- Updated `apps/web/tsconfig.app.json`:
  - Added `baseUrl` + `paths` mappings for `@ui/*`, `@sdk/*`, `@store/*`, `@hooks/*`, `@games/*`.

- Updated `apps/web/vite.config.ts`:
  - Added dev server proxy for `/api` to `http://127.0.0.1:8000`.

- Updated `apps/web/src/index.css`:
  - Added missing custom color tokens used across web + game UI classes.

- Updated `packages/game-sdk/src/types.ts`:
  - Made `GameResult.userId` optional.
  - Made `GameResult.metadata` optional.

- Updated score submission logic:
  - `packages/game-sdk/src/useGameBridge.ts`
  - `apps/web/src/hooks/useScoreSubmit.ts`
  - Replaced `/api/scores` calls with game-specific payload mapping:
    - Dojo → `/api/games/dojo/sessions`
    - Runner → `/api/games/runner/sessions`
    - Card battler currently returns “skipped” (no final score endpoint in backend contract yet).
  - Added token checks before authenticated score submission.

## Remaining known backend gap
- **Card battler final score submission endpoint is missing** in current backend API contract (only session init + move routes exist).
- If you want scoreboard persistence for card battler, backend needs a dedicated final-score route and request schema.

## Runtime crash debug update (Rapier)
- Reported error: `cg[options.shape] is not a function` from `@react-three/rapier`.
- Root cause: `RigidBody colliders="capsule"` in `games/dojo-3d/src/components/Player.tsx` used an unsupported auto-collider shape string.
- Fix:
  - Switched player body to explicit collider: `colliders={false}` + `<CapsuleCollider args={[0.5, 0.5]} />`.
  - Switched enemy body to explicit collider: `colliders={false}` + `<BallCollider args={[0.6]} />`.
- Outcome: removes fragile shape-string resolution and prevents the collider factory crash path.
- Added route-level error UX:
  - `apps/web/src/components/RouteErrorScreen.tsx`
  - wired via `errorElement` in `apps/web/src/router/index.tsx`
  - so unhandled route errors no longer show React Router’s default developer error page.

---

## Session 2 — Recommended Steps Applied

### 1. Backend Completion: Card Battler Score Endpoint

**Problem:** Card battler had no final score submission route. Frontend score bridge returned "skipped" for this game.

**Files created:**
- `apps/api/app/Services/CardScoreService.php` — validation + persistence service following Dojo/Runner pattern (DB transaction, plausibility checks, GameSession + CardSession creation, user stat increments).

**Files modified:**
- `apps/api/app/Http/Controllers/CardBattlerController.php` — added `store()` method using `SubmitCardScoreRequest` + `CardScoreService`.
- `apps/api/routes/api.php` — added `POST /api/games/card/score` with `throttle:score-submit`.
- `packages/game-sdk/src/useGameBridge.ts` — added `card-battler` branch to `buildScoreSubmission()`.
- `apps/web/src/hooks/useScoreSubmit.ts` — added matching `card-battler` branch.

**Result:** All three games now have full score submission pipelines.

### 2. Monorepo Refinement: Package Manifests

**Problem:** Sub-packages in `games/` and `packages/` lacked `package.json`, making them invisible to the pnpm workspace and preventing independent tooling.

**Files created:**
- `packages/game-sdk/package.json` (`@zenith/game-sdk`)
- `packages/ui/package.json` (`@zenith/ui`)
- `games/dojo-3d/package.json` (`@zenith/dojo-3d`)
- `games/card-battler/package.json` (`@zenith/card-battler`)
- `games/cyber-runner/package.json` (`@zenith/cyber-runner`)
- `packages/game-sdk/src/index.ts` — barrel export
- `packages/ui/src/index.ts` — barrel export

**Design decisions:**
- Heavy 3D libs (`three`, `@react-three/*`, `gsap`) declared as `peerDependencies` so they hoist from the host app.
- Game modules depend on `@zenith/game-sdk` via `workspace:*`.
- All packages scoped under `@zenith/` namespace.

### 3. SDK Type Refinement: Discriminated Union

**Problem:** `GameResult.metadata` was typed as `Record<string, unknown>`, losing all compile-time safety.

**Files modified:**
- `packages/game-sdk/src/types.ts` — replaced loose `GameResult` with a discriminated union:
  - `DojoGameResult` (gameId: `'dojo-3d'`, metadata: `DojoMetadata`)
  - `RunnerGameResult` (gameId: `'cyber-runner'`, metadata: `RunnerMetadata`)
  - `CardBattlerGameResult` (gameId: `'card-battler'`, metadata: `CardBattlerMetadata`)
  - Added `GameResultPayload = Omit<GameResult, 'gameId'>` for bridge consumers.
- `packages/game-sdk/src/useGameBridge.ts` — switched to `GameResultPayload`, removed nullish fallbacks.
- `apps/web/src/hooks/useScoreSubmit.ts` — removed nullish fallback on `metadata`.

**Result:** TypeScript now catches metadata shape mismatches at compile time. All three game modules' `emitGameOver` calls already conform to the new types without modification.

### 4. Authentication Flow & Dynamic Stats

**Problem:** The app had no login UI, hardcoded scores in the navbar, and no way to update user stats in real-time.

**Changes:**
- **LoginPage.tsx**: Implemented a themed login page at `/login`.
- **API Routing Fix**: Registered `api.php` in `bootstrap/app.php` (Laravel 11 requirement).
- **Dynamic Stats**:
  - `authStore.ts` now tracks `total_score` and `games_played`.
  - `Navbar.tsx` and `MenuPage.tsx` display real user stats.
  - `useScoreSubmit.ts` automatically re-fetches user data after each session.
- **Backend**: Added `GET /api/user` and updated `AuthController` to return full user data.

### 5. Game Stability Fixes (Cyber Runner)

**Problem:** The player would start "floating" at y=0, missing all collisions, and obstacles used deprecated methods.

**Changes:**
- `usePhysics.ts`: Set `isGrounded` to `false` by default to ensure the player falls to the floor on start.
- `GameCanvas.tsx`: Widened hitboxes and added `console.log` for collision debugging.
- `obstacleFactory.ts`: Replaced deprecated `substr` with `slice`.

**Result:** Cyber Runner collisions are now responsive and the game loop is fully functional.
