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
- [Environment Variables](#environment-variables)
- [Enhancement Roadmap](#enhancement-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview
Zenith Protocol is a highly scalable, web-based game platform. It employs a **Plugin Architecture** where a central React "Host App" lazy-loads self-contained game modules via dynamic imports and communicates through a shared event bus. All scores, authentication, and state validation are securely handled via a robust Laravel 11 backend.

## Games
| Game | Tech Stack | Description |
|------|------------|-------------|
| **Dojo 3D** | R3F, Rapier, Three.js | Wave-based arena survival fighter in full 3D. |
| **Card Battler** | DOM, GSAP 3, Zustand | Tactical turn-based strategy card game. |
| **Cyber Runner** | HTML5 Canvas, GSAP | Infinite 2.5D side-scrolling platformer. |

## Tech Stack
**Frontend**
- React 18+ (Vite)
- TypeScript
- Tailwind CSS v3
- Zustand
- GSAP 3
- React Three Fiber & Rapier

**Backend**
- Laravel 11 (PHP 8.3)
- MySQL 8+
- Laravel Sanctum
- Laravel Horizon / Reverb
- Pest (Testing)

## Project Structure
```text
─── PROJECT ROOT
    ├── apps/
    │   ├── web/                  ← Vite + React SPA (Host App)
    │   └── api/                  ← Laravel 11 backend
    ├── packages/
    │   ├── ui/                   ← Shared design system components
    │   ├── game-sdk/             ← Types + event bus shared by all games
    │   └── config/               ← Shared ESLint, Prettier, TS config
    └── games/
        ├── dojo-3d/              ← 3D Wave survival game
        ├── card-battler/         ← Turn-based card strategy game
        └── cyber-runner/         ← 2.5D infinite runner
```

## Getting Started

### Prerequisites
- **Node 20+** and **pnpm 9+**
- **PHP 8.3+** and **Composer**
- **MySQL 8+**

### 🛠️ Backend Setup (apps/api)
1. `cd apps/api`
2. `composer install`
3. `cp .env.example .env` (Configure your DB credentials here)
4. `php artisan key:generate`
5. `php artisan migrate:fresh --seed` (This creates the `admin@gamehub.com` user)
6. `php artisan serve` (Starts API at http://localhost:8000)

### 🌐 Frontend Setup (apps/web)
1. `cd apps/web`
2. `pnpm install`
3. `pnpm dev` (Starts App at http://localhost:5173)

### ⚡ Unified Commands (Root)
If your environment allows running scripts, you can run these from the project root:
- `pnpm dev:api` — Starts the Laravel server
- `pnpm dev:web` — Starts the Vite dev server

> [!TIP]
> **Windows Users**: If you see an error about scripts being disabled (Execution Policy), use `pnpm.cmd` instead of `pnpm`, or run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in an Administrator PowerShell.

## Authentication
Use the following credentials after seeding:
- **Identifier:** `admin@gamehub.com`
- **Key:** `password`

## Environment Variables
See the `.env.example` files in the respective `apps/api/` and `apps/web/` directories.

## Enhancement Roadmap
- [ ] **Tier 1**: Authentication, Real-time Leaderboards, User Profiles, Sound System.
- [ ] **Tier 2**: Achievements, Daily Challenges, Mobile Touch, PWA setup.
- [ ] **Tier 3**: Replay System, Spectator Mode, Custom SDK CLI, Admin Analytics.

## Contributing
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for our Conventional Commits guide and PR workflow.

## License
MIT
