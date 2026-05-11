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
