# Zenith Protocol — Game SDK CLI

The Zenith CLI tool provides interactive scaffolding of new game modules under the `games/` workspace directory. It generates clean, optimized boilerplate code configured for 2D Canvas, 2D DOM, or 3D React Three Fiber (R3F) games.

## Features

- **Interactive Prompts**: Prompts for game name, slug, type (Canvas, DOM, R3F), description, and author.
- **Strict Discriminated Unions**: Scaffolds a placeholder metadata interface and result type from the start, avoiding generic `Record<string, unknown>` wrappers.
- **Dependency Automation**: Automatically adds required three/R3F peerDependencies for 3D games and runs `pnpm install` in the monorepo workspace.
- **Integration Instructions**: Generates a local `README.md` inside the scaffolded plugin with step-by-step registration instructions.

## Installation & Usage

To run the CLI tool, use `node` from the workspace root pointing to the CLI binary:

```bash
node packages/cli/bin/create-zenith-plugin.js
```

## Prompt Options

1. **Game Name**: Display name of the game (e.g., `Asteroid Storm`).
2. **Game Slug**: Machine name for folder and routing path (automatically generated as `asteroid-storm`).
3. **Game Type**:
   - `2D Canvas`: HTML5 canvas rendering inside React.
   - `2D DOM`: Pure absolute-positioned React DOM components.
   - `3D R3F`: React Three Fiber canvas with Rapier physics.
4. **Description**: Brief summary of the game.
5. **Author**: Author name.

## Directory Structure Generated

```
games/{{slug}}/
├── README.md               <-- Custom instructions for manual registry wiring
├── package.json            <-- Monorepo workspace package description
├── src/
│   ├── index.tsx          <-- Entry point component matching GameLayout plugin loader
│   ├── types.ts           <-- Typed metadata interfaces avoiding generic wrappers
│   ├── store/
│   │   └── store.ts       <-- Zustand state management
│   ├── components/
│   │   ├── HUD.tsx        <-- Neon score and health bar elements
│   │   └── GameCanvas.tsx <-- Core canvas/game view (for canvas/R3F types)
│   └── hooks/
│       └── useGameLoop.ts <-- requestAnimationFrame game loop (for canvas type)
```

## Manual Registration Instructions

After scaffolding a new game, the CLI will output instructions to register the game with the main system. These include:

1. **Extend `GameResult` in `packages/game-sdk/src/types.ts`**:
   Insert the generated `<GameName>GameResult` type into the discriminated union to ensure strict compile-time check when calling `emitGameOver`.

2. **Register Plugin in `apps/web/src/lib/pluginLoader.ts`**:
   Add the lazy imports for route resolving.

3. **Register Game Manifest in `apps/web/src/main.tsx`**:
   Call `registerGame()` with details of title, tags, description, and route.
