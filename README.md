# Zenith Protocol
> The next-generation industrial-grade web gaming platform.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/ThreeJs-black?style=for-the-badge&logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)

## Table of Contents
- [Overview](#overview)
- [Games](#games)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Tests](#tests)
- [Build](#build)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Architecture Highlights](#architecture-highlights)
- [Contributing](#contributing)
- [License](#license)

## Overview
Zenith Protocol is a highly scalable, web-based game platform. It employs a **Plugin Architecture** where a central React "Host App" lazy-loads self-contained game modules via dynamic imports and communicates through a shared event bus. All scores, authentication, and state validation are securely handled via a robust Laravel 11 backend.

All **17 audit bugs** have been fixed as of 2026-05-28. ✅

## Games
| Game | Tech Stack | Description |
|------|------------|-------------|
| **Dojo 3D** | R3F, Rapier, Three.js | Wave-based arena survival fighter in full 3D. |
| **Card Battler** | DOM, GSAP 3, Zustand | Tactical turn-based strategy card game. |
| **Cyber Runner** | HTML5 Canvas, GSAP | Infinite 2.5D side-scrolling platformer. |

## Tech Stack
**Frontend**
- React 18+ (Vite)
- TypeScript (strict)
- Tailwind CSS v3
- Zustand (state management)
- GSAP 3 (animations)
- React Three Fiber & Rapier (3D)
- Laravel Echo + Pusher (real-time)
- vite-plugin-pwa (offline support)

**Backend**
- Laravel 11 (PHP 8.3)
- MySQL 8+
- Laravel Sanctum (auth)
- Laravel Reverb (WebSockets)
- Pest (Testing)

**Monorepo**
- pnpm workspaces
- Shared packages: `@zenith/game-sdk`, `@zenith/ui`, `@zenith/cli`

## Project Structure
```text
Zenith Protocol/
├── AGENTS.md                       ← Auto-loaded agent context (full architecture)
├── CODEBASE_SCAN.md                ← Full scan reference
├── package.json                    ← Root workspace (pnpm)
├── pnpm-workspace.yaml
│
├── apps/
│   ├── web/                        ← React 18 + Vite + TypeScript frontend
│   │   ├── package.json            ← name: "web"
│   │   ├── vite.config.ts          ← /api proxy, dedupe, manualChunks, vite-plugin-pwa
│   │   ├── tsconfig.app.json       ← strict, verbatimModuleSyntax
│   │   ├── .env                    ← VITE_API_URL=/api, VITE_REVERB_*
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx             ← Entry: registers 3 games, RouterProvider, registerSW
│   │       ├── App.tsx              ← Root: <OfflineBanner /> + <AchievementToast /> + <Outlet />
│   │       ├── index.css            ← Tailwind v3 + theme tokens + .zenith-range-slider
│   │       ├── env.d.ts             ← Vite + vite-plugin-pwa/client env var types
│   │       ├── router/              ← createBrowserRouter
│   │       ├── components/          ← 17 components (Navbar, Leaderboard, etc.)
│   │       ├── hooks/               ← 8 hooks (useAuth, useEcho, useLeaderboard, etc.)
│   │       ├── layouts/             ← MainLayout, GameLayout
│   │       ├── lib/                 ← axios.ts, pluginLoader.ts, offlineQueue.ts
│   │       ├── worker/              ← syncWorker.ts
│   │       ├── pages/               ← MenuPage, LoginPage, RegisterPage, ProfilePage
│   │       ├── store/               ← authStore, leaderboardStore, gameStore,
│   │       │                          achievementStore, challengeStore
│   │       └── public/
│   │           ├── icons/           ← pwa-192.png, pwa-512.png
│   │           ├── images/          ← game banner PNGs
│   │           └── sounds/          ← dojo/, runner/, card/, ui/
│   │
│   └── api/                        ← Laravel 11 backend (PHP 8.3)
│       ├── composer.json           ← platform: php 8.3.0
│       ├── bootstrap/app.php       ← registers api.php, channels.php
│       ├── .env                    ← DB=mysql, BROADCAST=reverb
│       ├── artisan
│       ├── routes/
│       │   ├── api.php             ← All API routes
│       │   ├── channels.php        ← Broadcasting channels
│       │   ├── console.php         ← challenges:generate scheduled at 23:00 UTC
│       │   └── web.php
│       ├── database/
│       │   ├── migrations/         ← users, game_sessions, dojo/card/runner sessions,
│       │   │                          achievements, user_achievements,
│       │   │                          daily_challenges, user_challenges
│       │   └── seeders/
│       │       └── DatabaseSeeder.php ← 12 achievements + users + sessions
│       └── app/
│           ├── Http/
│           │   ├── Controllers/    ← 9 controllers (Auth, Leaderboard, Profile, etc.)
│           │   ├── Requests/       ← 5 form requests
│           │   └── Resources/      ← 5 API resources
│           ├── Models/             ← 9 models (User, GameSession, Achievement, etc.)
│           ├── Repositories/       ← LeaderboardRepository, GameSessionRepository
│           ├── Services/           ← 6 services (DojoScore, CardScore, RunnerScore,
│           │                          CardMove, Achievement, ChallengeCompletion)
│           ├── Jobs/               ← CheckAchievements.php
│           ├── Events/             ← ScoreSubmitted.php, AchievementUnlocked.php
│           └── Console/
│               └── Commands/       ← GenerateDailyChallenges.php
│
├── games/
│   ├── dojo-3d/                    ← @zenith/dojo-3d — R3F + Rapier 3D survival
│   ├── cyber-runner/               ← @zenith/cyber-runner — 2D canvas runner
│   └── card-battler/               ← @zenith/card-battler — 2D card game
│
└── packages/
    ├── game-sdk/                   ← @zenith/game-sdk — shared types, eventBus, sound
    ├── ui/                         ← @zenith/ui — GlassCard, NeonButton, StatBadge, etc.
    └── cli/                        ← @zenith/cli — create-zenith-plugin scaffold tool
```

## Getting Started

### Prerequisites
- **Node 20+** and **pnpm 9+**
- **PHP 8.3+** and **Composer**
- **MySQL 8+**

### Installation

```bash
# 1. Clone & install frontend dependencies
pnpm install

# 2. Install backend dependencies
cd apps/api && composer install && cd ../..

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your DB credentials, then:

# 4. Generate app key & run migrations
cd apps/api
php artisan key:generate
php artisan migrate:fresh --seed
cd ../..
```

## Running the Project

Open **three separate terminals** from the project root:

```bash
# Terminal 1 — Laravel API (http://127.0.0.1:8000)
cd apps/api && php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — Vite frontend (http://localhost:5173)
pnpm -C apps/web dev

# Terminal 3 (optional) — WebSocket server (port 8080)
cd apps/api && php artisan reverb:start
```

> **Windows PowerShell**: Use `php artisan serve --host=127.0.0.1 --port=8000` directly. If scripts are blocked, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` as Administrator.

### Unified Commands (Root package.json)
```bash
pnpm dev:api     # Starts Laravel server (port 8000)
pnpm dev:web     # Starts Vite dev server (port 5173)
```

## Tests
```bash
# Backend — 11 Pest tests (all passing)
pnpm test:api

# Frontend
pnpm test:web
```

## Build
```bash
pnpm build       # Builds frontend for production (752 modules)
```

## Authentication
Use the following credentials after seeding:
- **Email:** `admin@gamehub.com`
- **Password:** `password`

## Environment Variables
See the `.env.example` files in `apps/api/` and `apps/web/`.

### Key Backend Variables
| Variable | Description |
|----------|-------------|
| `DB_DATABASE` | MySQL database name |
| `REVERB_APP_ID` | Reverb WebSocket app ID |
| `REVERB_APP_KEY` | Reverb WebSocket app key |
| `REVERB_APP_SECRET` | Reverb WebSocket app secret |

### Key Frontend Variables
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (default: `/api` via Vite proxy) |
| `VITE_REVERB_KEY` | Reverb public key |
| `VITE_REVERB_HOST` | Reverb host (default: `localhost`) |

## Architecture Highlights

- **Plugin Architecture**: Games are self-contained packages under `games/`, lazy-loaded by the host app via `pluginLoader.ts`
- **Discriminated Union Types**: `GameResult` is typed by `gameId` — never use `Record<string, unknown>` for metadata
- **Local-First Moves**: Card Battler applies moves locally first, then syncs to server (fire-and-forget) for responsive feel
- **Offline Queue**: Scores queued to IndexedDB when offline, auto-flushed via `syncWorker.ts` on reconnect
- **Real-Time Leaderboards**: Laravel Echo subscribes to public `leaderboard.{gameId}` channels
- **Achievement System**: 12 achievements evaluated server-side via dispatched `CheckAchievements` job
- **Daily Challenges**: Generated daily at 23:00 UTC via scheduled artisan command

## Contributing
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our Conventional Commits guide and PR workflow.

## License
AUST(Not YET)
