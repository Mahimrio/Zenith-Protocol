# Zenith Protocol — Agent Context

> **Auto-loaded on every new session.** This file replaces the need for codebase scanning.
> **Repo:** https://github.com/Mahimrio/Zenith-Protocol
> **Last updated:** 2026-05-28

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
| Frontend | React 18, Vite, TypeScript (strict), Tailwind CSS v3, Zustand, GSAP 3, React Three Fiber + Rapier, React Router v6 |
| Backend | Laravel 11, PHP 8.3, MySQL, Laravel Sanctum, Pest, Laravel Reverb |
| Monorepo | pnpm workspaces: apps/web, apps/api, games/*, packages/* |

> ⚠️ Stack correction: Laravel 11 (not 13), Tailwind v3 (not v4), MySQL (not SQLite)

### MONOREPO WIRING — CONFIRMED WORKING

- Root `dev:web` → `pnpm -C apps/web dev`
- Root `dev:api` → `cd apps/api && php artisan serve --host=127.0.0.1 --port=8000`
- `apps/web` package name is `"web"` (was fixed from `"web_temp"`)
- All sub-packages under `@zenith/` namespace: `@zenith/game-sdk`, `@zenith/ui`, `@zenith/dojo-3d`, `@zenith/card-battler`, `@zenith/cyber-runner`, `@zenith/cli`
- Heavy libs (three, @react-three/*, gsap) are peerDependencies — they hoist from the host app
- Game modules depend on `@zenith/game-sdk` via `workspace:*`

### TYPESCRIPT & VITE — CONFIRMED WORKING (0 build errors)

- `tsconfig.app.json`: `"ignoreDeprecations": "6.0"`, NO `"types"` restriction, `"jsxImportSource": "react"`, `"typeRoots"` configured, three + howler path aliases added
- `vite.config.ts`: `/api` proxy + `dedupe: [react, react-dom, three, gsap, zustand]` + `vite-plugin-pwa`
- Theme tokens defined in `apps/web/src/index.css`
- `GameStatus`: const object + derived type (enum banned by `erasableSyntaxOnly`)
- All type-only imports use `import type` (`verbatimModuleSyntax`)
- All unused params prefixed with `_` (`noUnusedLocals` enforced)
- `@types/react` + `@types/react-dom` installed at workspace root
- `@types/howler` installed in `packages/game-sdk/package.json`
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
`.zenith-range-slider` CSS class exists for neon-themed volume sliders.

---

## GLOBAL RULES

- TypeScript strict mode. No `any` types.
- Functional components only.
- Tailwind + custom tokens for all styling.
- JSDoc on every component and hook.
- Laravel: Form Requests → validation, Services → logic, Repositories → DB queries, Resources → API responses.
- Never trust the frontend for scores or moves.
- All private API routes protected by `auth:sanctum` middleware.
- Laravel 11: register route files in `bootstrap/app.php` (already done).

---

## CRITICAL — DISCRIMINATED UNION TYPES (`packages/game-sdk/src/types.ts`)

`GameResult` is a discriminated union — DO NOT use generic metadata:

```typescript
DojoGameResult        { gameId: 'dojo-3d',       metadata: DojoMetadata }
RunnerGameResult      { gameId: 'cyber-runner',   metadata: RunnerMetadata }
CardBattlerGameResult { gameId: 'card-battler',   metadata: CardBattlerMetadata }
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
├── package.json                 ← Root workspace (pnpm)
├── pnpm-workspace.yaml
│
├── apps/
│   ├── web/                     ← React 18 + Vite + TypeScript frontend
│   │   ├── package.json         ← name: "web"
│   │   ├── vite.config.ts       ← /api proxy, dedupe, manualChunks, vite-plugin-pwa
│   │   ├── tsconfig.app.json    ← strict, verbatimModuleSyntax
│   │   ├── .env                 ← VITE_API_URL=/api, VITE_REVERB_*
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx          ← Entry: registers 3 games, RouterProvider, registerSW
│   │       ├── App.tsx           ← Root: <OfflineBanner /> + <AchievementToast /> + <Outlet />
│   │       ├── index.css         ← Tailwind v3 + theme tokens + .zenith-range-slider
│   │       ├── env.d.ts          ← Vite + vite-plugin-pwa/client env var types
│   │       ├── router/
│   │       │   └── index.tsx     ← createBrowserRouter
│   │       ├── components/       ← 17 components (see below)
│   │       ├── hooks/            ← 8 hooks (see below)
│   │       ├── layouts/          ← MainLayout, GameLayout
│   │       ├── lib/              ← axios.ts, pluginLoader.ts, offlineQueue.ts
│   │       ├── worker/           ← syncWorker.ts
│   │       ├── pages/            ← MenuPage, LoginPage, RegisterPage, ProfilePage
│   │       ├── store/            ← authStore, leaderboardStore, gameStore,
│   │       │                        achievementStore, challengeStore
│   │       └── public/
│   │           ├── icons/        ← pwa-192.png, pwa-512.png
│   │           └── sounds/       ← dojo/, runner/, card/, ui/ (.gitkeep placeholders)
│   │
│   └── api/                     ← Laravel 11 backend (PHP 8.3)
│       ├── composer.json        ← platform: php 8.3.0
│       ├── bootstrap/app.php    ← registers api.php, channels.php
│       ├── .env                 ← DB=mysql, BROADCAST=reverb
│       ├── artisan
│       ├── routes/
│       │   ├── api.php          ← All API routes (see below)
│       │   ├── channels.php     ← Broadcasting channels
│       │   ├── console.php      ← challenges:generate scheduled at 23:00 UTC
│       │   └── web.php
│       ├── database/
│       │   ├── migrations/      ← users, game_sessions, dojo/card/runner sessions,
│       │   │                        achievements, user_achievements,
│       │   │                        daily_challenges, user_challenges
│       │   └── seeders/
│       │       └── DatabaseSeeder.php  ← 12 achievements + users + sessions
│       └── app/
│           ├── Http/
│           │   ├── Controllers/  ← 9 controllers (see below)
│           │   ├── Requests/     ← 5 form requests
│           │   └── Resources/    ← 5 API resources
│           ├── Models/           ← 9 models (see below)
│           ├── Repositories/     ← 3 files
│           ├── Services/         ← 6 services (see below)
│           ├── Jobs/             ← CheckAchievements.php
│           ├── Events/           ← ScoreSubmitted.php, AchievementUnlocked.php
│           └── Console/
│               └── Commands/     ← GenerateDailyChallenges.php
│
├── games/
│   ├── dojo-3d/                 ← @zenith/dojo-3d — R3F + Rapier 3D survival
│   ├── cyber-runner/            ← @zenith/cyber-runner — 2D canvas runner
│   └── card-battler/            ← @zenith/card-battler — 2D card game
│
└── packages/
    ├── game-sdk/                ← @zenith/game-sdk — shared types, eventBus, sound
    ├── ui/                      ← @zenith/ui — GlassCard, NeonButton, etc.
    └── cli/                     ← @zenith/cli — create-zenith-plugin scaffold tool
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
| `store/achievementStore.ts` | achievements[], unlocked (Set), pendingToast queue | fetchAchievements(), unlockAchievement(), clearToast() |
| `store/challengeStore.ts` | challenges[], resetsAt, totalEarnedToday, isLoading | fetchChallenges(), markCompleted(id) |

### Hooks

| File | Purpose |
|------|---------|
| `hooks/useAuth.ts` | Re-exports authStore state + actions |
| `hooks/useScoreSubmit.ts` | Score submission with retry logic, routes to correct API endpoint per game |
| `hooks/useEcho.ts` | Singleton Laravel Echo instance (Reverb/pusher-js), subscribe/unsubscribe |
| `hooks/useLeaderboard.ts` | REST fetch + Echo subscription to `leaderboard.{gameId}` |
| `hooks/useProfile.ts` | Profile stats, paginated sessions, game filter, avatar upload, syncs to authStore |
| `hooks/useAchievements.ts` | Fetch on mount + Echo subscribe to private `user.{userId}` channel |
| `hooks/useDailyChallenges.ts` | Fetch on login, countdown via DOM ref mutation (no React state re-renders) |
| `hooks/useNetworkStatus.ts` | Tracks isOnline/wasOffline, auto-triggers syncWorker.flushQueue() on reconnect |

### Components

| File | Purpose |
|------|---------|
| `components/Navbar.tsx` | Top nav: logo, score, speaker mute (GSAP wiggle), settings gear, avatar dropdown |
| `components/NeonGrid.tsx` | Full-viewport animated neon grid background (GSAP pan) |
| `components/GameCard.tsx` | Game card with thumbnail, tags, deploy button, GSAP hover/click |
| `components/GameGrid.tsx` | Responsive grid with ScrollTrigger stagger entrance |
| `components/GameOverModal.tsx` | Slide-up modal with final score, play again / menu buttons |
| `components/GlobalLoadingScreen.tsx` | Suspense fallback — animated SVG ring |
| `components/PauseMenu.tsx` | Listens to PAUSE_REQUESTED/RESUME_REQUESTED events |
| `components/RouteErrorScreen.tsx` | Error boundary for route errors |
| `components/ProtectedRoute.tsx` | Token hydration → fetchMe → loading → Outlet. requireAdmin prop ready |
| `components/Leaderboard.tsx` | Game tab switcher (GSAP indicator), top-3 badges, live pulse, new-entry GSAP animation |
| `components/VolumeControl.tsx` | Styled range slider, neon-cyan thumb, gradient fill, % badge |
| `components/SettingsModal.tsx` | GSAP scale+opacity entrance, Audio (3 VolumeControls + mute toggle), Account section |
| `components/AchievementToast.tsx` | Fixed top-right z-50, GSAP back.out slide-in → 3s → slide-out, neon-amber glow |
| `components/DailyChallengeBanner.tsx` | Horizontal banner, countdown timer (DOM ref), 3 ChallengeCards, GSAP slide-down |
| `components/ChallengeCard.tsx` | GlassCard, colored left border per game, progress bar, GSAP "COMPLETED" stamp |
| `components/OfflineBanner.tsx` | GSAP amber/green banner, pending count, auto-shows when offline |

> ✅ FIXED: `GameOverModal` and `PauseMenu` are now properly imported, subscribed
> to `gameBus` events (`GAME_OVER`, `PAUSE_REQUESTED`, `RESUME_REQUESTED`),
> and conditionally rendered inside `GameLayout.tsx` (see `FIX_001_GameLayout_GameOver_Pause.md`).

### Layouts

| File | Purpose |
|------|---------|
| `layouts/MainLayout.tsx` | Persistent shell: Navbar + Outlet |
| `layouts/GameLayout.tsx` | Full-screen game container, lazy-loads game module via pluginLoader. Renders `GameOverModal` on `GAME_OVER` and `PauseMenu` on `PAUSE_REQUESTED`. |

### Lib / Worker

| File | Purpose |
|------|---------|
| `lib/axios.ts` | Axios instance, Bearer token injector, 401 auto-logout + redirect to /login |
| `lib/pluginLoader.ts` | Pre-created lazy components for 3 games, registerGame/launchGamePlugin |
| `lib/offlineQueue.ts` | IndexedDB wrapper (DB: zenith-offline, store: scoreQueue). enqueue/dequeue/remove/getCount |
| `worker/syncWorker.ts` | flushQueue() — POSTs all queued scores, retry up to 3×, drops after 3 failures |

### Pages

| File | Purpose |
|------|---------|
| `pages/MenuPage.tsx` | Animated title, GameGrid, DailyChallengeBanner, collapsible Rankings (Leaderboard), footer |
| `pages/LoginPage.tsx` | Neon-themed login form, "Register" link |
| `pages/RegisterPage.tsx` | Mirrors LoginPage, GSAP error animations, "Sign In" link |
| `pages/ProfilePage.tsx` | Hero banner (AvatarUpload + score + rank), 3-col stats grid, session history with filter tabs |

### PWA Config

| Item | Detail |
|------|--------|
| Plugin | `vite-plugin-pwa ^1.3.0` in `apps/web/package.json` devDependencies |
| registerSW | Called in `main.tsx` from `virtual:pwa-register` |
| Icons | `public/icons/pwa-192.png` + `pwa-512.png` (neon-cyan Z on dark bg) |
| Caching | `/sounds/` → CacheFirst. `/api/leaderboards` → NetworkFirst |
| Offline | Scores queued to IndexedDB via `offlineQueue.ts`, flushed by `syncWorker.ts` on reconnect |

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
| POST | /games/card/sessions | CardBattlerController@initSession | auth:sanctum |
| POST | /games/card/moves | CardBattlerController@playMove | auth:sanctum |
| POST | /games/card/score | CardBattlerController@store | auth:sanctum + throttle:score-submit |
| POST | /games/runner/sessions | RunnerController@store | auth:sanctum + throttle:score-submit |
| GET | /leaderboards | LeaderboardController@index | auth:sanctum, cached 60s |
| GET | /user/sessions | UserSessionController@index | auth:sanctum |
| GET | /achievements | AchievementController@index | auth:sanctum |
| GET | /daily-challenges | DailyChallengeController@index | auth:sanctum |

### Controllers

| File | Methods |
|------|---------|
| `AuthController.php` | register(), login(), logout(), me() |
| `UserProfileController.php` | show() (single leftJoin query), sessions() (paginated), updateAvatar() |
| `DojoController.php` | store() → DojoScoreService |
| `CardBattlerController.php` | store() → CardScoreService, initSession(), playMove() → CardMoveService |
| `RunnerController.php` | store() → RunnerScoreService |
| `LeaderboardController.php` | index() — cached 60s, returns data[] + meta{your_rank, your_score} |
| `UserSessionController.php` | index() — all sessions for authenticated user |
| `AchievementController.php` | index() — grouped by game_id, unlocked status + progress % |
| `DailyChallengeController.php` | index() — today's 3 challenges, user completion, resets_at, earned today |

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
| `SessionHistoryResource.php` | id, game_id, score, completed_at, detail (match per game type) |
| `GameSessionResource.php` | id, game_id, score, completed_at, metadata |
| `LeaderboardEntryResource.php` | computed_rank, user{id,name,avatar_url}, score, completed_at |
| `LeaderboardResource.php` | data[] + generated_at + game_id |

### Services

| File | Logic |
|------|-------|
| `DojoScoreService.php` | Score validation (frontend-aligned formula: `floor(100*(1+wave*0.2))` per kill, 2.5x combo ceiling), creates GameSession + DojoSession, increments user stats, broadcasts ScoreSubmitted, dispatches CheckAchievements, calls ChallengeCompletionService |
| `CardScoreService.php` | Score ceiling validation (cost-aware: max cost 9 per card + victory 500 bonus, 1.2x tolerance), creates sessions, broadcasts, dispatches CheckAchievements, calls ChallengeCompletionService |
| `RunnerScoreService.php` | Distance/speed physics validation, creates sessions, broadcasts, dispatches CheckAchievements, calls ChallengeCompletionService |
| `CardMoveService.php` | Validates card plays against cached Redis game state (30min TTL) |
| `AchievementService.php` | check(User, GameSession) — evaluates all condition types via PHP match, creates UserAchievement records, broadcasts AchievementUnlocked |
| `ChallengeCompletionService.php` | checkAndComplete(User, GameSession) — checks today's challenges for game_id, marks completed, awards reward_points to user.total_score |

### Models

| File | Key Fields | Relations |
|------|-----------|-----------|
| `User.php` | name, email, password, total_score, games_played, avatar_url | HasMany GameSession |
| `GameSession.php` | user_id, game_id, score, metadata (array), server_validated_at | BelongsTo User, HasOne DojoSession/CardSession/RunnerSession |
| `DojoSession.php` | session_id, waves_survived, enemies_killed, max_combo, survival_ms | BelongsTo GameSession |
| `CardSession.php` | session_id, turns_survived, cards_played, cards_drawn, final_enemy_hp | BelongsTo GameSession |
| `RunnerSession.php` | session_id, distance_meters, peak_speed, obstacles_avoided | BelongsTo GameSession |
| `Achievement.php` | slug (unique), name, description, icon, game_id (nullable), condition_type, condition_value | HasMany UserAchievement |
| `UserAchievement.php` | user_id, achievement_id, unlocked_at | BelongsTo User + Achievement |
| `DailyChallenge.php` | date, game_id, challenge_type (enum), target_value, title, description, reward_points | HasMany UserChallenge |
| `UserChallenge.php` | user_id, challenge_id, completed_at (nullable), progress_value | BelongsTo User + DailyChallenge |

### Repositories

| File | Methods |
|------|---------|
| `LeaderboardRepositoryInterface.php` | getTopScores(), getUserRank(), getUserBestScore() |
| `EloquentLeaderboardRepository.php` | Implements interface — orderByDesc score, count+1 for rank |
| `GameSessionRepositoryInterface.php` | create(), findByUser(), findById() |

### Events

| File | Channel | Event Name | Payload |
|------|---------|------------|---------|
| `ScoreSubmitted.php` | `leaderboard.{gameId}` (public) | `score.submitted` | rank, user{id,name,avatar_url}, score, game_id, submitted_at |
| `AchievementUnlocked.php` | `user.{userId}` (private) | `achievement.unlocked` | achievement{slug,name,description,icon}, unlocked_at |

### Jobs

| File | Purpose |
|------|---------|
| `CheckAchievements.php` | ShouldQueue — dispatched afterCommit() from all 3 score services. Resolves User + GameSession, calls AchievementService::check() |

### Console Commands

| File | Signature | Schedule |
|------|-----------|----------|
| `GenerateDailyChallenges.php` | `challenges:generate` | dailyAt('23:00') UTC — creates 3 challenges for tomorrow using date-seeded mt_srand() for reproducibility. Idempotent. |

---

## ACHIEVEMENTS SYSTEM

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

### Condition Evaluation (PHP match in AchievementService)

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
  → DB transaction → broadcast ScoreSubmitted (leaderboard)
  → ChallengeCompletionService::checkAndComplete()
  → CheckAchievements::dispatch(userId, sessionId)->afterCommit()
    → AchievementService::check(user, session)
      → Evaluate conditions → Create UserAchievement records
      → broadcast AchievementUnlocked (private channel user.{userId})
        → useEcho listens → achievementStore.unlockAchievement()
        → AchievementToast GSAP animation
```

---

## SHARED PACKAGES

### @zenith/game-sdk

| File | Purpose |
|------|---------|
| `src/types.ts` | GameStatus (const), GameManifest, discriminated union GameResult, GameResultPayload |
| `src/eventBus.ts` | Typed mitt singleton: GAME_STARTED, GAME_OVER, SCORE_SUBMIT, PAUSE_REQUESTED, RESUME_REQUESTED, NAVIGATE_HOME |
| `src/useGameBridge.ts` | React hook: emitGameOver (score submission, accepts optional spectatorMode param), emitScore, requestPause |
| `src/store/soundStore.ts` | Zustand + persist ('zenith-sound'): master/sfx/music volumes, mute, playSfx() for non-React code |
| `src/hooks/useSound.ts` | Howl in useRef, volume subscription, cleanup on unmount |
| `src/hooks/useMusic.ts` | Singleton music via module-level currentMusicHowl, auto fade-in/out |
| `src/utils/device.ts` | isTouchDevice(), isMobile(), useIsMobile() hook with resize+orientation listeners |
| `src/index.ts` | Barrel exports: all types, hooks, stores, utils |

### @zenith/ui

| File | Purpose |
|------|---------|
| `src/GlassCard.tsx` | Backdrop-blur glassmorphism card, optional neon glow (cyan/purple/amber/green), forwardRef |
| `src/NeonButton.tsx` | GSAP hover/click, 3 variants (primary/ghost/danger), 3 sizes, loading state |
| `src/HealthBar.tsx` | GSAP animated width, color prop, label + current/max |
| `src/ScoreDisplay.tsx` | GSAP countTo animation, neon-amber theming |
| `src/components/StatBadge.tsx` | Glass card widget, color mapping tokens, GSAP countUp on numeric values, gsap.context() cleanup |
| `src/components/AvatarUpload.tsx` | Circular uploader, FileReader preview, GSAP scale+rotate during upload, initials fallback |
| `src/components/SessionHistoryTable.tsx` | Grid layout, game pill badges (coral/teal/blue), skeleton pulse, Load More, empty state |
| `src/index.ts` | Barrel exports |

### @zenith/cli

| File | Purpose |
|------|---------|
| `package.json` | name: @zenith/cli, bin: create-zenith-plugin |
| `bin/create-zenith-plugin.js` | Interactive CLI: name→slug, type (Canvas/DOM/R3F), author. Copies templates, replaces {{PLACEHOLDER}} tokens, runs pnpm install |
| `README.md` | Usage, prompts, generated structure, manual wiring steps |
| `templates/common/` | package.json.tmpl, types.ts.tmpl (typed metadata, NOT Record<string,unknown>) |
| `templates/canvas/` | index.tsx, store.ts, HUD.tsx, GameCanvas.tsx, useGameLoop.ts |
| `templates/dom/` | index.tsx, store.ts, HUD.tsx, GameBoard.tsx |
| `templates/r3f/` | index.tsx, store.ts, HUD.tsx, ArenaCanvas.tsx, Arena.tsx, Player.tsx, usePlayerController.ts |

> CLI usage: `node packages/cli/bin/create-zenith-plugin.js`
> R3F template uses `colliders={false}` + explicit CapsuleCollider/BallCollider (NOT shape-strings)

---

## GAME MODULES

### @zenith/dojo-3d

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver on GAME_OVER, Escape → requestPause |
| `src/types.ts` | DojoGameStatus, PlayerState, EnemyState, DojoGameState |
| `src/store/dojoStore.ts` | Zustand: gameStatus, score, wave, survivedMs, player, enemies |
| `src/hooks/usePlayerController.ts` | WASD + Space input, 500ms attack cooldown, SFX integration |
| `src/hooks/useCombat.ts` | Damage calc, enemy death, combo tracking |
| `src/hooks/useEnemyAI.ts` | Enemy movement toward player (>15 units = patrol, <15 = chase, <1.5 = attack) |
| `src/hooks/useWaveManager.ts` | Wave spawning via spawnPatterns, state machine |
| `src/hooks/useTouchController.ts` | Touch-driven controller (mobile), same interface as keyboard |
| `src/components/DojoCanvas.tsx` | R3F Canvas + Physics + Arena + Player + EnemySpawner + ImpactParticles |
| `src/components/Arena.tsx` | Static floor + boundary walls (Rapier rigid bodies) |
| `src/components/Player.tsx` | CapsuleCollider (colliders={false} explicit), WASD movement, attack glow |
| `src/components/Enemy.tsx` | BallCollider (colliders={false} explicit), type-based colors |
| `src/components/EnemySpawner.tsx` | Renders all enemies from store |
| `src/components/HUD.tsx` | HealthBar, score, wave, renders VirtualJoystick + AttackButton on mobile |
| `src/components/CursedEnergyFX.tsx` | Animated cursed energy ring on attack |
| `src/components/ImpactParticles.tsx` | Particle burst on enemy hit |
| `src/components/VirtualJoystick.tsx` | Custom virtual joystick (NO nipplejs), 120px, pointer events, normalized {x,y} output |
| `src/components/AttackButton.tsx` | 80px circular mobile attack button, GSAP scale pulse, 500ms cooldown |
| `src/utils/combatFormulas.ts` | calculateDamage(), calculateScoreReward() |
| `src/utils/spawnPatterns.ts` | generateWaveEnemies(wave) — spawns outside 5-unit radius |

### @zenith/cyber-runner

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver on GAME_OVER, Escape → requestPause |
| `src/store/runnerStore.ts` | Zustand: gameStatus, score, distance, speedLevel, isJumping, isSliding, isGrounded |
| `src/hooks/useGameLoop.ts` | rAF loop: deltaTime capped at 100ms, pauses on tab hidden, rAF in ref (not state) |
| `src/hooks/useInputHandler.ts` | Space/ArrowUp → jump, ArrowDown/S → slide, SFX on action |
| `src/hooks/useObstacles.ts` | Obstacle spawning (1.5s interval), movement, AABB collision |
| `src/hooks/useParallax.ts` | 4-layer background scrolling at different speeds |
| `src/hooks/usePhysics.ts` | GRAVITY=1800px/s², JUMP_FORCE=-620px/s, isGrounded=false on start |
| `src/components/GameCanvas.tsx` | 2D canvas: background layers, player, obstacles, collision check per frame |
| `src/components/RunnerHUD.tsx` | Score, distance, speed level, game over overlay |
| `src/components/TouchControls.tsx` | Fullscreen invisible overlay (mobile): left=jump, right=slide, preventDefault |
| `src/utils/backgroundLayers.ts` | 4-layer parallax background rendering via Canvas API |
| `src/utils/collision.ts` | AABB with widened hitboxes |
| `src/utils/obstacleFactory.ts` | Random obstacle generation: BARRIER / LOW_BLOCK / HOVER_MINE |

### @zenith/card-battler

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver, Escape → requestPause. Spectator autoplay useEffect. "Spectate Game" toggle button |
| `src/types.ts` | CardType (const), CardGameStatus (const), Card, CardPlayerState, CardEnemyState |
| `src/cardDatabase.ts` | 7 cards (attack/defense/utility), createStartingDeck(), getRandomCard() |
| `src/store/cardStore.ts` | Game lifecycle, draw/play cards, end turn, isVictory tracking, SFX, spectatorMode: boolean, toggleSpectatorMode() |
| `src/components/GameBoard.tsx` | Enemy area (face-up in spectator), player area, "End Turn" disabled in spectator |
| `src/components/Card.tsx` | Type-based coloring, pointer events (not mouse), drag-to-play via Pointer Events API |
| `src/components/PlayerHand.tsx` | Fan layout (desktop), horizontal scroll (mobile), drag-play disabled in spectator |
| `src/components/ManaBar.tsx` | Neon-cyan mana pips |
| `src/components/TurnIndicator.tsx` | Turn number + End Turn button |

> SPECTATOR MODE: Local AI vs AI toggle — NOT Reverb broadcasting.
> `emitGameOver` passes `spectatorMode=true` → score submission skipped in useGameBridge.

---

## WEBSOCKET CONFIG

| Layer | Config |
|-------|--------|
| Backend driver | Laravel Reverb (pusher protocol) |
| Public channel | `leaderboard.{gameId}` → `score.submitted` |
| Private channel | `user.{userId}` → `achievement.unlocked` |
| Frontend singleton | `useEcho()` hook — module-level instance, subscribe/unsubscribe helpers |
| Frontend deps | pusher-js, laravel-echo |
| Dev setup | `php artisan reverb:start` (port 8080) in separate terminal |

---

## CI STATUS

- Frontend: lint clean, TypeScript 0 errors, pnpm build succeeds (499 modules)
- Backend: PHP 8.3 platform locked, 11 Pest tests passing (all 11 passing as of 2026-05-28)
- GitHub Actions: both frontend-ci and backend-ci jobs green

---

## KEY ARCHITECTURAL DECISIONS

1. **Discriminated Union Types** — `GameResult` by `gameId`, never `Record<string, unknown>`
2. **Const Object + Derived Type** — `GameStatus` (enum banned by `erasableSyntaxOnly`)
3. **Type-Only Imports** — `import type` for all types (`verbatimModuleSyntax`)
4. **Unused Param Prefix** — `_` prefix (`noUnusedLocals` enforced)
5. **Lazy Components Pre-Created** — outside render loop in `pluginLoader.ts`
6. **Singleton Echo** — module-level instance in `useEcho.ts`
7. **Score Validation** — Backend recalculates scores server-side; frontend never trusted
8. **Cache + Broadcast** — Leaderboard cached 60s, busted on submission, broadcast for real-time
9. **Achievement Jobs** — `afterCommit()` ensures DB transaction completes before check
10. **Rapier Colliders** — Always `colliders={false}` + explicit CapsuleCollider/BallCollider. NEVER shape-string colliders (they crash)
11. **Touch Input** — Custom VirtualJoystick (no nipplejs), Pointer Events for Card Battler
12. **Offline Queue** — IndexedDB via offlineQueue.ts, flushed by syncWorker.ts on reconnect
13. **Spectator Mode** — Local AI vs AI in Card Battler only. No backend events. Score skipped.
14. **SDK CLI** — `node packages/cli/bin/create-zenith-plugin.js` scaffolds new game modules

---

## KNOWN BUGS (from audit — fix before launch)

| Priority | Bug | File to fix |
|----------|-----|-------------|
| ~~P0~~ **FIXED** | ~~GameOverModal + PauseMenu never mounted~~ | ~~`GameLayout.tsx`~~ |
| ~~P0~~ **FIXED** | ~~Dojo score formula mismatch → 422 rejected~~ | ~~`DojoScoreService.php`~~ (see `FIX_002_Dojo_Card_ScoreValidation.md`) |
| ~~P0~~ **FIXED** | ~~Card score formula mismatch → 422 rejected~~ | ~~`CardScoreService.php`~~ (see `FIX_002_Dojo_Card_ScoreValidation.md`) |
| ~~P1~~ **FIXED** | ~~Logout never revokes server token~~ | ~~`authStore.ts`~~ (see `FIX_003_AuthLogout_SyncToken.md`) |
| ~~P1~~ **FIXED** | ~~PWA sync uses wrong localStorage key~~ | ~~`syncWorker.ts`~~ (see `FIX_003_AuthLogout_SyncToken.md`) |
| ~~P1~~ **FIXED** | ~~Enemy death has no GSAP animation~~ | ~~`Enemy.tsx`, `dojoStore.ts`~~ (see `FIX_004_DojoDeathAnimation_Metadata.md`) |
| ~~P1~~ **FIXED** | ~~enemiesKilled + maxCombo not in metadata~~ | ~~`dojoStore.ts`, `index.tsx`~~ (see `FIX_004_DojoDeathAnimation_Metadata.md`) |
| ~~P1~~ **FIXED** | ~~obstaclesAvoided always 0~~ | ~~`runnerStore.ts`, `GameCanvas.tsx`~~ (see `FIX_006_RunnerObstacleCollision.md`) |
| ~~P1~~ **FIXED** | ~~Card victory +500 bonus missing~~ | ~~`cardStore.ts`, `index.tsx`~~ (see `FIX_005_CardVictoryMetadata.md`) |
| ~~P2~~ **FIXED** | ~~No 80% inner hitbox on Runner~~ | ~~`collision.ts`~~ (see `FIX_006_RunnerObstacleCollision.md`) |
| ~~P2~~ **FIXED** | ~~Dojo attack ranges off (2.0/1.2 → 1.5/1.5)~~ | ~~`useCombat.ts`, `useEnemyAI.ts`~~ (see `FIX_007_DojoCombatRanges_Combo_Patrol.md`) |
| ~~P2~~ **FIXED** | ~~Combo shows at 2+ kills (should be 3+)~~ | ~~`HUD.tsx`~~ (see `FIX_007_DojoCombatRanges_Combo_Patrol.md`) |
| ~~P2~~ **FIXED** | ~~Enemy patrol missing (freeze when far)~~ | ~~`useEnemyAI.ts`~~ (see `FIX_007_DojoCombatRanges_Combo_Patrol.md`) |
| ~~P2~~ **FIXED** | ~~Player motion trail missing~~ | ~~`Player.tsx`~~ (see `FIX_008_DojoTrail_ImpactPosition.md`) |
| ~~P2~~ **FIXED** | ~~ImpactParticles fixed at origin~~ | ~~`ImpactParticles.tsx`, `dojoStore.ts`~~ (see `FIX_008_DojoTrail_ImpactPosition.md`) |
| P2 | Player legs missing on Runner | `GameCanvas.tsx` |
