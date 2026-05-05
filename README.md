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
- Node 20+
- pnpm 8+
- PHP 8.3+
- Composer
- MySQL 8+

### Installation
1. Clone the repo
2. `pnpm install`
3. `cd apps/api && cp .env.example .env`
4. `composer install`
5. `php artisan key:generate`
6. Configure DB in `.env`
7. `php artisan migrate --seed`
8. `cd apps/web && pnpm dev` (Terminal 1)
9. `cd apps/api && php artisan serve` (Terminal 2)

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
