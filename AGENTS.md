# Zenith Protocol — Agent Context

> **Auto-loaded on every new session.** This file replaces the need for codebase scanning.
> **Repo:** https://github.com/Mahimrio/Zenith-Protocol
> **Last updated:** 2026-05-19

---

## HOW TO USE THIS FILE

When a new feature request comes in:
1. Read this file — it contains the full architecture, all existing files, and all conventions.
2. You already know every file path, every export, every route, every type.
3. Write the new code directly. No scanning needed.

---

## EXISTING STACK

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TypeScript (strict), Tailwind CSS v4, Zustand, GSAP 3, React Three Fiber + Rapier, React Router v6 |
| Backend | Laravel 13, PHP 8.3, SQLite (dev), Laravel Sanctum, Pest, Laravel Reverb |
| Monorepo | pnpm workspaces: apps/web, apps/api, games/*, packages/* |

### MONOREPO WIRING — CONFIRMED WORKING

- Root `dev:web` → `pnpm -C apps/web dev`
- Root `dev:api` → `cd apps/api && php artisan serve --host=127.0.0.1 --port=8000`
- `apps/web` package name is `"web"` (was fixed from `"web_temp"`)
- All sub-packages under `@zenith/` namespace: `@zenith/game-sdk`, `@zenith/ui`, `@zenith/dojo-3d`, `@zenith/card-battler`, `@zenith/cyber-runner`
- Heavy libs (three, @react-three/*, gsap) are peerDependencies — they hoist from the host app
- Game modules depend on `@zenith/game-sdk` via `workspace:*`

### TYPESCRIPT & VITE — CONFIRMED WORKING (0 build errors)

- `tsconfig.app.json`: `"ignoreDeprecations": "6.0"`, NO `"types"` restriction, `"jsxImportSource": "react"`, `"typeRoots"` configured, three path alias added
- `vite.config.ts`: `/api` proxy + `dedupe: [react, react-dom, three, gsap, zustand]`
- Theme tokens defined in `apps/web/src/index.css`
- `GameStatus`: const object + derived type (enum banned by `erasableSyntaxOnly`)
- All type-only imports use `import type` (`verbatimModuleSyntax`)
- All unused params prefixed with `_` (`noUnusedLocals` enforced)
- `@types/react` + `@types/react-dom` installed at workspace root
- `pluginLoader.ts`: lazy components pre-created outside render loop

---

## GLOBAL DESIGN SYSTEM

| Token | Value |
|-------|-------|
| `bg-primary` | `#0a0a0f` |
| `bg-secondary` | `#10101a` |
| `bg-glass` | `rgba(255,255,255,0.05)` |
| `border-glass` | `rgba(255,255,255,0.08)` |
| `neon-cyan` | `#00f5ff` |
| `neon-purple` | `#8b5cf6` |
| `neon-amber` | `#f59e0b` |
| `neon-green` | `#10b981` |
| `text-primary` | `#f0f0ff` |
| `text-muted` | `#6b7280` |

Glassmorphism: `backdrop-blur-md + bg-glass + border-glass + rounded-xl`
Custom CSS classes in `index.css`: `bg-bg-primary`, `text-neon-cyan`, `border-border-glass` — use these, do not redefine.

---

## GLOBAL RULES

- TypeScript strict mode. No `any` types.
- Functional components only.
- Tailwind + custom tokens for all styling.
- JSDoc on every component and hook.
- Laravel: Form Requests → validation, Services → logic, Repositories → DB queries, Resources → API responses.
- Never trust the frontend for scores or moves.
- All private API routes protected by `auth:sanctum` middleware.
- Laravel 11+: register route files in `bootstrap/app.php` (already done).

---

## CRITICAL — DISCRIMINATED UNION TYPES (`packages/game-sdk/src/types.ts`)

`GameResult` is a discriminated union — DO NOT use generic metadata:

```typescript
DojoGameResult   { gameId: 'dojo-3d',       metadata: DojoMetadata }
RunnerGameResult { gameId: 'cyber-runner',   metadata: RunnerMetadata }
CardBattlerGameResult { gameId: 'card-battler', metadata: CardBattlerMetadata }
GameResultPayload = Omit<GameResult, 'gameId'>  // used by bridge consumers
```

When writing new code that calls `emitGameOver()`, use `GameResultPayload`. Never use `Record<string, unknown>` for metadata.

---

## COMPLETE FILE INVENTORY

### Directory Tree

```
Zenith Protocol/
├── AGENTS.md                    ← THIS FILE (auto-loaded context)
├── CODEBASE_SCAN.md             ← Full scan reference
├── ACHIEVEMENTS_SYSTEM.md       ← Achievement system docs
├── package.json                 ← Root workspace (pnpm)
├── pnpm-workspace.yaml
│
├── apps/
│   ├── web/                     ← React 18 + Vite + TypeScript frontend
│   │   ├── package.json         ← name: "web"
│   │   ├── vite.config.ts       ← /api proxy, dedupe, manualChunks
│   │   ├── tsconfig.app.json    ← strict, verbatimModuleSyntax
│   │   ├── tsconfig.node.json
│   │   ├── tsconfig.json
│   │   ├── .env                 ← VITE_API_URL=/api, VITE_REVERB_*
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx          ← Entry: registers 3 games, RouterProvider
│   │       ├── App.tsx           ← Root: <AchievementToast /> + <Outlet />
│   │       ├── index.css         ← Tailwind + theme tokens + .zenith-range-slider
│   │       ├── env.d.ts          ← Vite env var types
│   │       ├── router/index.tsx  ← createBrowserRouter
│   │       ├── components/       ← 13 components (see below)
│   │       ├── hooks/            ← 6 hooks (see below)
│   │       ├── layouts/          ← MainLayout, GameLayout
│   │       ├── lib/              ← axios.ts, pluginLoader.ts
│   │       ├── pages/            ← MenuPage, LoginPage, RegisterPage, ProfilePage
│   │       └── store/            ← authStore, leaderboardStore, gameStore, achievementStore
│   │
│   └── api/                     ← Laravel 13 backend (PHP 8.3)
│       ├── composer.json        ← platform: php 8.3.0
│       ├── bootstrap/app.php    ← registers api.php, channels.php
│       ├── bootstrap/providers.php
│       ├── .env                 ← DB=sqlite, BROADCAST=reverb
│       ├── artisan
│       ├── routes/
│       │   ├── api.php          ← All API routes (see below)
│       │   ├── channels.php     ← Broadcasting channels
│       │   ├── console.php
│       │   └── web.php
│       ├── database/
│       │   ├── migrations/      ← 2 achievement migrations + existing
│       │   └── seeders/DatabaseSeeder.php  ← 12 achievements + users + sessions
│       └── app/
│           ├── Http/
│           │   ├── Controllers/  ← 8 controllers
│           │   ├── Requests/     ← 5 form requests
│           │   └── Resources/    ← 5 API resources
│           ├── Models/           ← 7 models
│           ├── Repositories/     ← 3 files
│           ├── Services/         ← 4 score services + AchievementService
│           ├── Jobs/             ← CheckAchievements
│           ├── Events/           ← ScoreSubmitted, AchievementUnlocked
│           └── Providers/AppServiceProvider.php
│
├── games/
│   ├── dojo-3d/                 ← @zenith/dojo-3d — R3F + Rapier 3D survival
│   ├── cyber-runner/            ← @zenith/cyber-runner — 2D canvas runner
│   └── card-battler/            ← @zenith/card-battler — 2D card game
│
└── packages/
    ├── game-sdk/                ← @zenith/game-sdk — shared types, eventBus, sound
    └── ui/                      ← @zenith/ui — GlassCard, NeonButton, etc.
```

---

## FRONTEND FILES (apps/web/src)

### Router (`router/index.tsx`)

| Route | Element | Protected? |
|-------|---------|------------|
| `/` | MenuPage (via MainLayout) | No |
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/play/:gameId` | GameLayout | Yes (ProtectedRoute) |
| `/profile` | ProfilePage (lazy) | Yes (ProtectedRoute) |
| errorElement | RouteErrorScreen | — |

### Stores (Zustand)

| File | State | Actions |
|------|-------|---------|
| `store/authStore.ts` | user, token, isAuthenticated, error | login(), logout(), register(), fetchMe(), updateUser() |
| `store/leaderboardStore.ts` | entries[], myRank, myScore, activeGame | fetchLeaderboard(), insertOrUpdateEntry(), setActiveGame() |
| `store/gameStore.ts` | registeredGames[], activeGame | registerGame(), launchGame(), closeGame() |
| `store/achievementStore.ts` | achievements[], unlocked (Set), pendingToast | fetchAchievements(), unlockAchievement(), clearToast() |

### Hooks

| File | Purpose |
|------|---------|
| `hooks/useAuth.ts` | Re-exports authStore state + actions |
| `hooks/useScoreSubmit.ts` | Score submission with retry logic, routes to correct API endpoint per game |
| `hooks/useEcho.ts` | Singleton Laravel Echo instance (Reverb/pusher-js), subscribe/unsubscribe |
| `hooks/useLeaderboard.ts` | REST fetch + Echo subscription to `leaderboard.{gameId}` |
| `hooks/useProfile.ts` | Profile stats, paginated sessions, game filter, avatar upload |
| `hooks/useAchievements.ts` | Fetch on mount + Echo subscribe to `user.{userId}` for real-time unlocks |

### Components

| File | Purpose |
|------|---------|
| `components/Navbar.tsx` | Top nav: logo, breadcrumb, score, speaker mute (GSAP wiggle), settings gear, avatar |
| `components/NeonGrid.tsx` | Full-viewport animated neon grid background |
| `components/GameCard.tsx` | Game card with thumbnail, tags, deploy button, GSAP hover/click |
| `components/GameGrid.tsx` | Responsive grid with ScrollTrigger stagger entrance |
| `components/GameOverModal.tsx` | Slide-up modal with final score, play again / menu buttons |
| `components/GlobalLoadingScreen.tsx` | Suspense fallback — animated SVG ring |
| `components/PauseMenu.tsx` | Listens to PAUSE_REQUESTED/RESUME_REQUESTED events |
| `components/RouteErrorScreen.tsx` | Error boundary for route errors |
| `components/ProtectedRoute.tsx` | Token hydration → fetchMe → loading → Outlet. requireAdmin prop ready |
| `components/Leaderboard.tsx` | Game tab switcher, top-3 badges, live pulse, new-entry animation |
| `components/VolumeControl.tsx` | Styled range slider, neon-cyan thumb, gradient fill, % badge |
| `components/SettingsModal.tsx` | GSAP entrance, Audio (3 VolumeControls + mute), Account section |
| `components/AchievementToast.tsx` | Fixed top-right z-50, GSAP slide-in/out, neon-amber glow |

### Layouts

| File | Purpose |
|------|---------|
| `layouts/MainLayout.tsx` | Persistent shell: Navbar + Outlet |
| `layouts/GameLayout.tsx` | Full-screen game container, lazy-loads game module |

### Lib

| File | Purpose |
|------|---------|
| `lib/axios.ts` | Axios instance, Bearer token injector, 401 auto-logout |
| `lib/pluginLoader.ts` | Pre-created lazy components for 3 games |

### Pages

| File | Purpose |
|------|---------|
| `pages/MenuPage.tsx` | Animated title, GameGrid, collapsible Rankings, footer with logout |
| `pages/LoginPage.tsx` | Neon-themed login form |
| `pages/RegisterPage.tsx` | Mirrors LoginPage, GSAP error animations |
| `pages/ProfilePage.tsx` | Hero banner, 3-col stats grid, session history with filter tabs |

---

## BACKEND FILES (apps/api)

### Routes (`routes/api.php`)

| Method | Path | Controller | Middleware |
|--------|------|------------|------------|
| POST | /auth/register | AuthController@register | throttle:10,1 |
| POST | /auth/login | AuthController@login | throttle:10,1 |
| POST | /auth/logout | AuthController@logout | auth:sanctum |
| GET | /user | AuthController@me | auth:sanctum |
| GET | /profile | UserProfileController@show | auth:sanctum |
| GET | /profile/sessions | UserProfileController@sessions | auth:sanctum |
| POST | /profile/avatar | UserProfileController@updateAvatar | auth:sanctum |
| POST | /games/dojo/sessions | DojoController@store | auth:sanctum + throttle:score-submit |
| POST | /games/card/sessions | CardBattlerController@initSession | auth:sanctum + throttle:score-submit |
| POST | /games/card/moves | CardBattlerController@playMove | auth:sanctum |
| POST | /games/card/score | CardBattlerController@store | auth:sanctum + throttle:score-submit |
| POST | /games/runner/sessions | RunnerController@store | auth:sanctum + throttle:score-submit |
| GET | /leaderboards | LeaderboardController@index | auth:sanctum + throttle:60,1 |
| GET | /user/sessions | UserSessionController@index | auth:sanctum |
| GET | /achievements | AchievementController@index | auth:sanctum |

### Controllers

| File | Methods |
|------|---------|
| `AuthController.php` | register(), login(), logout(), me() |
| `UserProfileController.php` | show() (single leftJoin), sessions() (paginated), updateAvatar() |
| `DojoController.php` | store() → DojoScoreService |
| `CardBattlerController.php` | store() → CardScoreService, initSession(), playMove() → CardMoveService |
| `RunnerController.php` | store() → RunnerScoreService |
| `LeaderboardController.php` | index() — cached 60s, returns data[] + meta |
| `UserSessionController.php` | index() — all sessions for user |
| `AchievementController.php` | index() — grouped by game_id, unlocked status, progress % |

### Requests (Form Validation)

| File | Rules |
|------|-------|
| `RegisterRequest.php` | name (max:30), email (unique), password (min:8, confirmed) |
| `SubmitDojoScoreRequest.php` | survival_ms, waves_survived, enemies_killed, score, max_combo |
| `SubmitCardScoreRequest.php` | turns_survived, cards_played, final_score |
| `SubmitRunnerScoreRequest.php` | distance_meters, peak_speed, obstacles_avoided |
| `PlayCardMoveRequest.php` | session_id (uuid), move_type, card_id |

### Resources

| File | Output |
|------|--------|
| `UserResource.php` | id, name, email, avatar_url, total_score, games_played, created_at |
| `SessionHistoryResource.php` | id, game_id, score, completed_at, detail (match per game) |
| `GameSessionResource.php` | id, game_id, score, completed_at, metadata |
| `LeaderboardEntryResource.php` | rank, user{id,name,avatar_url}, score, completed_at |
| `LeaderboardResource.php` | data[] + generated_at + game_id |

### Services

| File | Logic |
|------|-------|
| `DojoScoreService.php` | Score validation (±5%), creates session, increments user, broadcasts ScoreSubmitted, dispatches CheckAchievements |
| `CardScoreService.php` | Score validation (ceiling ×1.10), creates session, broadcasts, dispatches CheckAchievements |
| `RunnerScoreService.php` | Distance/speed validation, creates session, broadcasts, dispatches CheckAchievements |
| `CardMoveService.php` | Validates card plays against cached game state |
| `AchievementService.php` | check(User, GameSession) — evaluates conditions, creates UserAchievement, broadcasts AchievementUnlocked |

### Models

| File | Key Fields | Relations |
|------|-----------|-----------|
| `User.php` | name, email, password, total_score, games_played, avatar_url | HasMany GameSession |
| `GameSession.php` | user_id, game_id, score, metadata, server_validated_at | BelongsTo User, HasOne DojoSession/CardSession/RunnerSession |
| `DojoSession.php` | session_id, waves_survived, enemies_killed, max_combo, survival_ms | BelongsTo GameSession |
| `CardSession.php` | session_id, turns_survived, cards_played, cards_drawn, final_enemy_hp | BelongsTo GameSession |
| `RunnerSession.php` | session_id, distance_meters, peak_speed, obstacles_avoided | BelongsTo GameSession |
| `Achievement.php` | slug (unique), name, description, icon, game_id, condition_type, condition_value | HasMany UserAchievement |
| `UserAchievement.php` | user_id, achievement_id, unlocked_at | BelongsTo User + Achievement |

### Repositories

| File | Methods |
|------|---------|
| `LeaderboardRepositoryInterface.php` | getTopScores(), getUserRank(), getUserBestScore() |
| `EloquentLeaderboardRepository.php` | Implements interface |
| `GameSessionRepositoryInterface.php` | create(), findByUser(), findById() |

### Events

| File | Channel | Event Name | Payload |
|------|---------|------------|---------|
| `ScoreSubmitted.php` | `leaderboard.{gameId}` (public) | `score.submitted` | rank, user, score, game_id, submitted_at |
| `AchievementUnlocked.php` | `user.{userId}` (private) | `achievement.unlocked` | achievement{slug,name,description,icon}, unlocked_at |

### Jobs

| File | Purpose |
|------|---------|
| `CheckAchievements.php` | ShouldQueue — resolves User + GameSession, calls AchievementService::check() |

---

## SHARED PACKAGES

### @zenith/game-sdk

| File | Purpose |
|------|---------|
| `src/types.ts` | GameStatus (const), GameManifest, discriminated union GameResult, GameResultPayload |
| `src/eventBus.ts` | Typed mitt singleton: GAME_STARTED, GAME_OVER, SCORE_SUBMIT, PAUSE_REQUESTED, RESUME_REQUESTED, NAVIGATE_HOME |
| `src/useGameBridge.ts` | React hook: emitGameOver (score submission), emitScore, requestPause |
| `src/store/soundStore.ts` | Zustand + persist ('zenith-sound'), master/sfx/music volumes, playSfx() |
| `src/hooks/useSound.ts` | Howl in useRef, volume subscription, cleanup |
| `src/hooks/useMusic.ts` | Singleton music, auto fade-in/out |
| `src/index.ts` | Barrel exports |

### @zenith/ui

| File | Purpose |
|------|---------|
| `src/GlassCard.tsx` | Backdrop-blur glassmorphism card, optional neon glow, forwardRef |
| `src/NeonButton.tsx` | GSAP hover/click, 3 variants (primary/ghost/danger), 3 sizes, loading |
| `src/HealthBar.tsx` | GSAP animated width, color prop, label + current/max |
| `src/ScoreDisplay.tsx` | GSAP countTo, neon-amber theming |
| `src/components/StatBadge.tsx` | Glass card widget, color mapping, GSAP countUp |
| `src/components/AvatarUpload.tsx` | Circular uploader, FileReader preview, GSAP, initials fallback |
| `src/components/SessionHistoryTable.tsx` | Grid, game pill badges, skeleton pulse, Load More, empty state |
| `src/index.ts` | Barrel exports |

---

## GAME MODULES

### @zenith/dojo-3d

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver, Escape → requestPause |
| `src/types.ts` | DojoGameStatus, PlayerState, EnemyState |
| `src/store/dojoStore.ts` | Zustand: gameStatus, score, wave, survivedMs, player, enemies |
| `src/hooks/usePlayerController.ts` | WASD + Space, attack with SFX |
| `src/hooks/useCombat.ts` | Damage, enemy death, combo tracking |
| `src/hooks/useEnemyAI.ts` | Enemy movement, attack timing |
| `src/hooks/useWaveManager.ts` | Wave spawning |
| `src/components/DojoCanvas.tsx` | R3F Canvas + Physics + Arena + Player + EnemySpawner |
| `src/components/Arena.tsx` | Static floor + walls (Rapier rigid bodies) |
| `src/components/Player.tsx` | CapsuleCollider, WASD movement, attack glow |
| `src/components/Enemy.tsx` | BallCollider, type-based colors, health bar |
| `src/components/EnemySpawner.tsx` | Renders all enemies from store |
| `src/components/HUD.tsx` | HealthBar, score, wave, game over overlay |
| `src/components/CursedEnergyFX.tsx` | Animated cursed energy visual |
| `src/components/ImpactParticles.tsx` | Particle system |
| `src/utils/combatFormulas.ts` | calculateDamage(), calculateScoreReward() |
| `src/utils/spawnPatterns.ts` | generateWaveEnemies(wave) |

### @zenith/cyber-runner

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver, Escape → requestPause |
| `src/store/runnerStore.ts` | Zustand: gameStatus, score, distance, speedLevel, isJumping, isSliding, isGrounded |
| `src/hooks/useGameLoop.ts` | requestAnimationFrame loop |
| `src/hooks/useInputHandler.ts` | Space → jump, ArrowDown/Shift → slide, SFX |
| `src/hooks/useObstacles.ts` | Obstacle spawning, movement, AABB collision |
| `src/hooks/useParallax.ts` | Background scrolling |
| `src/components/GameCanvas.tsx` | 2D canvas: background, player, obstacles |
| `src/components/RunnerHUD.tsx` | Score, distance, speed level |
| `src/utils/backgroundLayers.ts` | Parallax grid rendering |
| `src/utils/collision.ts` | AABB collision with widened hitboxes |
| `src/utils/obstacleFactory.ts` | Random obstacle generation |

### @zenith/card-battler

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver, Escape → requestPause |
| `src/types.ts` | CardType (const), CardGameStatus (const), Card, CardPlayerState, CardEnemyState |
| `src/cardDatabase.ts` | 7 cards, createStartingDeck(), getRandomCard() |
| `src/store/cardStore.ts` | Game lifecycle, draw/play cards, end turn, SFX integration |
| `src/components/GameBoard.tsx` | Enemy area, player area, hand, mana bar, turn indicator |
| `src/components/Card.tsx` | Type-based coloring, cost badge |
| `src/components/PlayerHand.tsx` | Renders hand |
| `src/components/ManaBar.tsx` | Neon-cyan mana pips |
| `src/components/TurnIndicator.tsx` | Turn number + End Turn button |

---

## ACHIEVEMENTS SYSTEM (Added 2026-05-19)

### 12 Seeded Achievements

| Group | Slug | Name | Condition |
|-------|------|------|-----------|
| Global | `first_game` | First Steps | games_played ≥ 1 |
| Global | `veteran` | Veteran | games_played ≥ 50 |
| Global | `legend` | Legend | games_played ≥ 200 |
| Dojo | `first_blood` | First Blood | wave_reached ≥ 1 |
| Dojo | `warlord` | Warlord | wave_reached ≥ 10 |
| Dojo | `immortal` | Immortal | wave_reached ≥ 20 |
| Dojo | `combo_king` | Combo King | max_combo ≥ 10 |
| Card | `tactician` | Tactician | turns_survived ≤ 15 |
| Card | `grandmaster` | Grandmaster | games_played ≥ 10 |
| Card | `big_hand` | Big Hand | cards_drawn ≥ 7 |
| Runner | `speed_demon` | Speed Demon | distance ≥ 5000 |
| Runner | `untouchable` | Untouchable | distance ≥ 10000 |

### Condition Evaluation

| `condition_type` | Logic |
|------------------|-------|
| `games_played` | `$user->games_played >= value` |
| `score_threshold` | Dojo: `max_combo >= value`; else `score >= value` |
| `distance` | `runnerSession->distance_meters >= value` |
| `wave_reached` | `dojoSession->waves_survived >= value` |
| `turns_survived` | `cardSession->turns_survived <= value` OR `cards_drawn >= value` |

### Data Flow

```
Game Session → ScoreService::validateAndSave()
  → DB transaction → broadcast ScoreSubmitted
  → CheckAchievements::dispatch(userId, sessionId)->afterCommit()
    → AchievementService::check(user, session)
      → Evaluate conditions → Create UserAchievement
      → broadcast AchievementUnlocked (private channel)
        → Echo listens → achievementStore.unlockAchievement()
        → AchievementToast GSAP animation
```

---

## WEBSOCKET CONFIG

| Layer | Config |
|-------|--------|
| Backend driver | Laravel Reverb (pusher protocol) |
| Public channel | `leaderboard.{gameId}` → `score.submitted` |
| Private channel | `user.{userId}` → `achievement.unlocked` |
| Frontend | pusher-js via laravel-echo, singleton via `useEcho()` |

---

## CI STATUS

- Frontend: lint clean, TypeScript 0 errors, pnpm build succeeds
- Backend: PHP 8.3 platform locked, 11 Pest tests passing
- Branch: fix/resolve-frontend-lint merged to main

---

## KEY ARCHITECTURAL DECISIONS

1. **Discriminated Union Types** — `GameResult` by `gameId`, never `Record<string, unknown>`
2. **Const Object + Derived Type** — `GameStatus` (enum banned by `erasableSyntaxOnly`)
3. **Type-Only Imports** — `import type` for all types (`verbatimModuleSyntax`)
4. **Unused Param Prefix** — `_` prefix (`noUnusedLocals` enforced)
5. **Lazy Components Pre-Created** — outside render loop
6. **Singleton Echo** — module-level instance
7. **Score Validation** — Backend never trusts frontend scores
8. **Cache + Broadcast** — Leaderboard cached 60s, busted on submission
9. **Achievement Jobs** — `afterCommit()` ensures DB transaction completes before check
