# Zenith Protocol — Full Codebase Scan Report

> **Date:** 2026-05-19
> **Repo:** https://github.com/Mahimrio/Zenith-Protocol
> **Scan scope:** All source files across apps/, packages/, games/

---

## Monorepo Structure

```
Zenith Protocol/
├── package.json              # Root workspace (pnpm)
├── pnpm-workspace.yaml       # Workspace config
│
├── apps/
│   ├── web/                  # React 18 + Vite + TypeScript frontend
│   │   ├── package.json      # name: "web"
│   │   ├── vite.config.ts    # /api proxy, dedupe: react/three/gsap/zustand
│   │   ├── tsconfig.app.json # strict, verbatimModuleSyntax, erasableSyntaxOnly
│   │   ├── .env              # VITE_API_URL=/api, VITE_REVERB_*
│   │   └── src/
│   │       ├── App.tsx           # Root: <Outlet /> + AchievementToast
│   │       ├── main.tsx          # Entry: registers 3 games, mounts RouterProvider
│   │       ├── index.css         # Tailwind + theme tokens + .zenith-range-slider
│   │       ├── env.d.ts          # Vite env var types
│   │       ├── router/index.tsx  # createBrowserRouter: /, /login, /register, /play/:gameId, /profile
│   │       ├── components/       # 13 UI components
│   │       ├── hooks/            # 6 custom hooks
│   │       ├── layouts/          # MainLayout, GameLayout
│   │       ├── lib/              # axios.ts, pluginLoader.ts
│   │       ├── pages/            # MenuPage, LoginPage, RegisterPage, ProfilePage
│   │       └── store/            # authStore, leaderboardStore, gameStore, achievementStore
│   │
│   └── api/                  # Laravel 13 backend (PHP 8.3)
│       ├── composer.json     # platform: php 8.3.0
│       ├── bootstrap/app.php # registers api.php, channels.php
│       ├── .env              # DB=sqlite, BROADCAST=reverb
│       └── app/
│           ├── Http/
│           │   ├── Controllers/  # 8 controllers
│           │   ├── Requests/     # 5 form requests
│           │   └── Resources/    # 5 API resources
│           ├── Models/           # 5 models (User, GameSession, DojoSession, CardSession, RunnerSession)
│           ├── Repositories/     # LeaderboardRepositoryInterface + Eloquent implementation
│           ├── Services/         # 4 score services
│           ├── Events/           # ScoreSubmitted (ShouldBroadcastNow)
│           └── Providers/        # AppServiceProvider (rate limiter, repo binding)
│
├── games/
│   ├── dojo-3d/            # @zenith/dojo-3d — R3F + Rapier 3D survival
│   ├── cyber-runner/       # @zenith/cyber-runner — 2D canvas infinite runner
│   └── card-battler/       # @zenith/card-battler — 2D card game
│
└── packages/
    ├── game-sdk/           # @zenith/game-sdk — shared types, eventBus, useGameBridge, sound
    └── ui/                 # @zenith/ui — GlassCard, NeonButton, HealthBar, ScoreDisplay, StatBadge, AvatarUpload, SessionHistoryTable
```

---

## Frontend (apps/web) — Complete File Inventory

### Configuration

| File | Key Details |
|------|-------------|
| `package.json` | name: "web", deps: react 19, zustand 5, gsap 3, howler, axios, laravel-echo, pusher-js, @zenith/ui workspace:* |
| `vite.config.ts` | proxy /api → 127.0.0.1:8000, dedupe: [react, react-dom, three, gsap, zustand], manualChunks per game |
| `tsconfig.app.json` | ignoreDeprecations: "6.0", verbatimModuleSyntax, erasableSyntaxOnly, noUnusedLocals, noUnusedParameters, jsx: react-jsx |
| `.env` | VITE_API_URL=/api, VITE_REVERB_HOST/PORT/APP_KEY/SCHEME |

### Core

| File | Purpose |
|------|---------|
| `src/main.tsx` | Entry point — registers 3 games (dojo-3d, card-battler, cyber-runner), mounts RouterProvider |
| `src/App.tsx` | Root component — `<Outlet />` wrapper |
| `src/index.css` | Tailwind v4 + @theme tokens (neon-cyan, neon-purple, neon-amber, neon-green, bg-primary, bg-glass, border-glass) + .zenith-range-slider CSS |
| `src/env.d.ts` | TypeScript declarations for VITE_REVERB_* env vars |

### Router (`src/router/index.tsx`)

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

### Hooks

| File | Purpose |
|------|---------|
| `hooks/useAuth.ts` | Re-exports authStore state + actions |
| `hooks/useScoreSubmit.ts` | Score submission with retry logic, routes to correct API endpoint per game |
| `hooks/useEcho.ts` | Singleton Laravel Echo instance (Reverb/pusher-js), subscribe/unsubscribe helpers |
| `hooks/useLeaderboard.ts` | REST fetch + Echo subscription to `leaderboard.{gameId}`, auto-switches on game change |
| `hooks/useProfile.ts` | Profile stats fetch, paginated session history, game filter, avatar upload |

### Components

| File | Purpose |
|------|---------|
| `components/Navbar.tsx` | Top nav: logo, breadcrumb, score, speaker mute (GSAP wiggle), settings gear, avatar |
| `components/NeonGrid.tsx` | Full-viewport animated neon grid background (GSAP) |
| `components/GameCard.tsx` | Game card with thumbnail, tags, deploy button, GSAP hover/click |
| `components/GameGrid.tsx` | Responsive grid with ScrollTrigger stagger entrance |
| `components/GameOverModal.tsx` | Slide-up modal with final score, play again / menu buttons |
| `components/GlobalLoadingScreen.tsx` | Suspense fallback — animated SVG ring |
| `components/PauseMenu.tsx` | Listens to PAUSE_REQUESTED/RESUME_REQUESTED events |
| `components/RouteErrorScreen.tsx` | Error boundary for route errors |
| `components/ProtectedRoute.tsx` | Token hydration → fetchMe → loading → Outlet. requireAdmin prop ready |
| `components/Leaderboard.tsx` | Game tab switcher (GSAP indicator), top-3 badges, live pulse, new-entry animation, "Your Rank" footer |
| `components/VolumeControl.tsx` | Styled range slider with neon-cyan thumb, gradient fill, % badge |
| `components/SettingsModal.tsx` | GSAP scale+opacity entrance, Audio section (3 VolumeControls + mute), Account section |

### Layouts

| File | Purpose |
|------|---------|
| `layouts/MainLayout.tsx` | Persistent shell: Navbar + Outlet |
| `layouts/GameLayout.tsx` | Full-screen game container, lazy-loads game module via pluginLoader |

### Lib

| File | Purpose |
|------|---------|
| `lib/axios.ts` | Axios instance with Bearer token injector, 401 auto-logout |
| `lib/pluginLoader.ts` | Pre-created lazy components for 3 games, registerGame/launchGamePlugin |

### Pages

| File | Purpose |
|------|---------|
| `pages/MenuPage.tsx` | Animated title, GameGrid, collapsible Rankings section (GSAP height), footer with logout |
| `pages/LoginPage.tsx` | Neon-themed login form with glassmorphic card |
| `pages/RegisterPage.tsx` | Mirrors LoginPage, GSAP error animations |
| `pages/ProfilePage.tsx` | Hero banner (avatar + score + rank), 3-col stats grid, session history with game filter tabs |

---

## Backend (apps/api) — Complete File Inventory

### Configuration

| File | Key Details |
|------|-------------|
| `composer.json` | PHP ^8.3, Laravel ^13, Sanctum ^4, Reverb ^1.1, platform: php 8.3.0 |
| `bootstrap/app.php` | Registers web.php, api.php, console.php + broadcasting (channels.php) |
| `bootstrap/providers.php` | AppServiceProvider only |
| `.env` | DB=sqlite, BROADCAST=reverb, REVERB_APP_ID/KEY/SECRET, FRONTEND_URL, SANCTUM_STATEFUL_DOMAINS |

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

### Controllers

| File | Methods |
|------|---------|
| `Controllers/AuthController.php` | register(), login(), logout(), me() |
| `Controllers/UserProfileController.php` | show() (single leftJoin query), sessions() (paginated), updateAvatar() |
| `Controllers/DojoController.php` | store() → DojoScoreService |
| `Controllers/CardBattlerController.php` | store() → CardScoreService, initSession(), playMove() → CardMoveService |
| `Controllers/RunnerController.php` | store() → RunnerScoreService |
| `Controllers/LeaderboardController.php` | index() — cached 60s, returns data[] + meta |
| `Controllers/UserSessionController.php` | index() — all sessions for user |

### Requests (Form Validation)

| File | Rules |
|------|-------|
| `Requests/RegisterRequest.php` | name (max:30), email (unique), password (min:8, confirmed) |
| `Requests/SubmitDojoScoreRequest.php` | survival_ms, waves_survived, enemies_killed, score, max_combo |
| `Requests/SubmitCardScoreRequest.php` | turns_survived, cards_played, final_score |
| `Requests/SubmitRunnerScoreRequest.php` | distance_meters, peak_speed, obstacles_avoided |
| `Requests/PlayCardMoveRequest.php` | session_id (uuid), move_type (play_card/end_turn), card_id |

### Resources (API Response Transformers)

| File | Output |
|------|--------|
| `Resources/UserResource.php` | id, name, email, avatar_url, total_score, games_played, created_at |
| `Resources/SessionHistoryResource.php` | id, game_id, score, completed_at, detail (match per game) |
| `Resources/GameSessionResource.php` | id, game_id, score, completed_at, metadata |
| `Resources/LeaderboardEntryResource.php` | rank (computed_rank), user{id,name,avatar_url}, score, completed_at |
| `Resources/LeaderboardResource.php` | data[] + generated_at + game_id |

### Services

| File | Logic |
|------|-------|
| `Services/DojoScoreService.php` | Score validation (expected score ±5%), creates GameSession + DojoSession, increments user stats, broadcasts ScoreSubmitted |
| `Services/CardScoreService.php` | Score validation (ceiling ×1.10), creates GameSession + CardSession, broadcasts ScoreSubmitted |
| `Services/RunnerScoreService.php` | Distance/speed validation, creates GameSession + RunnerSession, broadcasts ScoreSubmitted |
| `Services/CardMoveService.php` | Validates card plays against cached game state (turn, mana, hand) |

### Models

| File | Key Fields | Relations |
|------|-----------|-----------|
| `Models/User.php` | name, email, password, total_score, games_played, avatar_url | HasMany GameSession |
| `Models/GameSession.php` | user_id, game_id, score, metadata (array), server_validated_at, started_at, completed_at | BelongsTo User, HasOne DojoSession/CardSession/RunnerSession |
| `Models/DojoSession.php` | session_id, waves_survived, enemies_killed, max_combo, survival_ms | BelongsTo GameSession |
| `Models/CardSession.php` | session_id, turns_survived, cards_played, cards_drawn, final_enemy_hp | BelongsTo GameSession |
| `Models/RunnerSession.php` | session_id, distance_meters, peak_speed, obstacles_avoided | BelongsTo GameSession |

### Repositories

| File | Methods |
|------|---------|
| `Repositories/LeaderboardRepositoryInterface.php` | getTopScores(), getUserRank(), getUserBestScore() |
| `Repositories/EloquentLeaderboardRepository.php` | Implements interface — orderByDesc score, count+1 for rank |
| `Repositories/GameSessionRepositoryInterface.php` | create(), findByUser(), findById() |

### Events

| File | Channel | Event Name | Payload |
|------|---------|------------|---------|
| `Events/ScoreSubmitted.php` | `leaderboard.{gameId}` (public) | `score.submitted` | rank, user{id,name,avatar_url}, score, game_id, submitted_at |

---

## Shared Packages

### @zenith/game-sdk (`packages/game-sdk/`)

| File | Purpose |
|------|---------|
| `src/types.ts` | GameStatus (const object), GameManifest, discriminated union GameResult (DojoGameResult, RunnerGameResult, CardBattlerGameResult), GameResultPayload |
| `src/eventBus.ts` | Typed mitt singleton: GAME_STARTED, GAME_OVER, SCORE_SUBMIT, PAUSE_REQUESTED, RESUME_REQUESTED, NAVIGATE_HOME |
| `src/useGameBridge.ts` | React hook: emitGameOver (with score submission), emitScore, requestPause, currentStatus tracking |
| `src/store/soundStore.ts` | Zustand + persist (localStorage 'zenith-sound'): master/sfx/music volumes, mute toggle, playSfx() utility |
| `src/hooks/useSound.ts` | Howl in useRef, volume subscription, cleanup on unmount |
| `src/hooks/useMusic.ts` | Singleton music via module-level currentMusicHowl, auto fade-in/out |
| `src/index.ts` | Barrel exports |

### @zenith/ui (`packages/ui/`)

| File | Purpose |
|------|---------|
| `src/GlassCard.tsx` | Backdrop-blur glassmorphism card, optional neon glow (cyan/purple/amber/green), forwardRef |
| `src/NeonButton.tsx` | GSAP hover/click animations, 3 variants (primary/ghost/danger), 3 sizes, loading state |
| `src/HealthBar.tsx` | GSAP animated width transition, color prop, label + current/max display |
| `src/ScoreDisplay.tsx` | GSAP countTo animation, neon-amber theming |
| `src/components/StatBadge.tsx` | Glass card widget, color mapping tokens, GSAP countUp on numeric values |
| `src/components/AvatarUpload.tsx` | Circular uploader, FileReader preview, GSAP scale+rotate, initials fallback |
| `src/components/SessionHistoryTable.tsx` | Grid layout, game pill badges (coral/teal/blue), skeleton pulse, Load More pagination, empty state |
| `src/index.ts` | Barrel exports |

---

## Game Modules

### @zenith/dojo-3d (`games/dojo-3d/`)

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver on GAME_OVER, Escape → requestPause |
| `src/types.ts` | DojoGameStatus, PlayerState, EnemyState, DojoGameState |
| `src/store/dojoStore.ts` | Zustand: gameStatus, score, wave, survivedMs, player, enemies |
| `src/hooks/usePlayerController.ts` | WASD + Space input, attack with SFX |
| `src/hooks/useCombat.ts` | Damage calculation, enemy death, combo tracking |
| `src/hooks/useEnemyAI.ts` | Enemy movement toward player, attack timing |
| `src/hooks/useWaveManager.ts` | Wave spawning via spawnPatterns |
| `src/components/DojoCanvas.tsx` | R3F Canvas + Physics + Arena + Player + EnemySpawner + ImpactParticles |
| `src/components/Arena.tsx` | Static floor + boundary walls (Rapier rigid bodies) |
| `src/components/Player.tsx` | CapsuleCollider (no shape-string), WASD movement, attack glow |
| `src/components/Enemy.tsx` | BallCollider (no shape-string), type-based colors, health bar |
| `src/components/EnemySpawner.tsx` | Renders all enemies from store |
| `src/components/HUD.tsx` | HealthBar, score, wave, game over overlay |
| `src/components/CursedEnergyFX.tsx` | Animated cursed energy visual effect |
| `src/components/ImpactParticles.tsx` | Particle system for combat impacts |
| `src/utils/combatFormulas.ts` | calculateDamage(), calculateScoreReward() |
| `src/utils/spawnPatterns.ts` | generateWaveEnemies(wave) |

### @zenith/cyber-runner (`games/cyber-runner/`)

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver on GAME_OVER, Escape → requestPause |
| `src/store/runnerStore.ts` | Zustand: gameStatus, score, distance, speedLevel, isJumping, isSliding, isGrounded |
| `src/hooks/useGameLoop.ts` | requestAnimationFrame loop: updates distance, speed, score |
| `src/hooks/useInputHandler.ts` | Space → jump, ArrowDown/Shift → slide, SFX on action |
| `src/hooks/useObstacles.ts` | Obstacle spawning, movement, AABB collision detection |
| `src/hooks/useParallax.ts` | Background layer scrolling at different speeds |
| `src/components/GameCanvas.tsx` | 2D canvas rendering: background, player, obstacles |
| `src/components/RunnerHUD.tsx` | Score, distance, speed level, game over overlay |
| `src/utils/backgroundLayers.ts` | Parallax grid background rendering |
| `src/utils/collision.ts` | AABB collision with widened hitboxes |
| `src/utils/obstacleFactory.ts` | Random obstacle generation (low/high/ground types) |

### @zenith/card-battler (`games/card-battler/`)

| File | Purpose |
|------|---------|
| `src/index.tsx` | Entry: startGame, emitGameOver on GAME_OVER, Escape → requestPause |
| `src/types.ts` | CardType (const), CardGameStatus (const), Card, CardPlayerState, CardEnemyState |
| `src/cardDatabase.ts` | 7 cards (attack/defense/utility), createStartingDeck(), getRandomCard() |
| `src/store/cardStore.ts` | Zustand: game lifecycle, draw/play cards, end turn, SFX integration (playSfx) |
| `src/components/GameBoard.tsx` | Enemy area, player area, hand, mana bar, turn indicator |
| `src/components/Card.tsx` | Type-based coloring, cost badge, click handler |
| `src/components/PlayerHand.tsx` | Renders hand of cards |
| `src/components/ManaBar.tsx` | Neon-cyan mana pips |
| `src/components/TurnIndicator.tsx` | Turn number + End Turn button |

---

## Design System Tokens

Defined in `apps/web/src/index.css`:

| Token | Value |
|-------|-------|
| `--color-bg-primary` | `#050508` |
| `--color-bg-secondary` | `#11131a` |
| `--color-text-primary` | `#f5f7ff` |
| `--color-text-muted` | `#8f96ad` |
| `--color-neon-cyan` | `#00f5ff` |
| `--color-neon-purple` | `#8b5cf6` |
| `--color-neon-amber` | `#f59e0b` |
| `--color-neon-green` | `#10b981` |
| `--color-glass` | `rgba(255, 255, 255, 0.06)` |
| `--color-border-glass` | `rgba(255, 255, 255, 0.12)` |

---

## WebSocket Configuration

| Layer | Config |
|-------|--------|
| Backend driver | Laravel Reverb (pusher protocol) |
| Backend channel | `leaderboard.{gameId}` (public) |
| Backend event | `score.submitted` (ShouldBroadcastNow) |
| Frontend transport | pusher-js via laravel-echo |
| Frontend singleton | `useEcho()` hook — created once, shared across app |

---

## CI Status (Confirmed Green)

- **Frontend CI:** lint clean, TypeScript 0 errors, pnpm build succeeds
- **Backend CI:** PHP 8.3 platform locked, bootstrap-cache + storage dirs created + chmod, migration syntax fixed
- **Branch:** fix/resolve-frontend-lint merged to main

---

## Key Architectural Decisions

1. **Discriminated Union Types** — `GameResult` is a discriminated union by `gameId`, never uses `Record<string, unknown>` for metadata
2. **Const Object + Derived Type** — `GameStatus` uses const object pattern (enum banned by `erasableSyntaxOnly`)
3. **Type-Only Imports** — All type-only imports use `import type` (`verbatimModuleSyntax`)
4. **Unused Param Prefix** — All unused params prefixed with `_` (`noUnusedLocals` enforced)
5. **Lazy Components Pre-Created** — `pluginLoader.ts` creates lazy components outside render loop
6. **Singleton Echo** — `useEcho()` uses module-level singleton instance
7. **Score Validation** — Backend never trusts frontend scores; each service validates against expected ranges
8. **Cache + Broadcast** — Leaderboard cached 60s, busted on each score submission, broadcast for real-time updates
