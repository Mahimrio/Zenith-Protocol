#!/usr/bin/env node

/**
 * @file create-zenith-plugin.js
 * @description CLI tool to scaffold a new Zenith game plugin/module.
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find workspace root
const workspaceRoot = path.resolve(__dirname, '../../..');

const program = new Command();

program
  .name('create-zenith-plugin')
  .description('Scaffold a new Zenith Protocol game module')
  .version('0.1.0')
  .action(async () => {
    console.log(chalk.bold.cyan('\n Zenith Protocol — Game Plugin Scaffolder\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter game name (e.g. Laser Hockey):',
        validate: input => input.trim() ? true : 'Game name is required.'
      },
      {
        type: 'input',
        name: 'slug',
        message: 'Enter game slug (used for folder name and routing):',
        default: answers => answers.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        validate: input => /^[a-z0-9-]+$/.test(input) ? true : 'Slug must contain only lowercase alphanumeric characters and hyphens.'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Choose game architecture:',
        choices: [
          { name: '2D Canvas (React + HTML5 Canvas Loop)', value: 'canvas' },
          { name: '2D DOM (Pure React Components)', value: 'dom' },
          { name: '3D R3F (React Three Fiber + Rapier Physics)', value: 'r3f' }
        ]
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter game description:',
        default: 'A custom Zenith Protocol game module.'
      },
      {
        type: 'input',
        name: 'author',
        message: 'Enter author name:',
        default: 'Developer'
      }
    ]);

    const targetDir = path.join(workspaceRoot, 'games', answers.slug);

    if (fs.existsSync(targetDir)) {
      console.log(chalk.red(`\nError: Directory games/${answers.slug} already exists.\n`));
      process.exit(1);
    }

    const spinner = ora('Creating files and directory structure...').start();

    try {
      // 1. Create target game directory
      fs.ensureDirSync(targetDir);

      // 2. Resolve template paths
      const commonTemplateDir = path.join(__dirname, '../src/templates/common');
      const typeTemplateDir = path.join(__dirname, `../src/templates/${answers.type}`);

      // 3. Copy common files
      fs.copySync(commonTemplateDir, targetDir);

      // 4. Copy type-specific files
      fs.copySync(typeTemplateDir, targetDir);

      // 5. Compute variables for replacement
      const capitalizedSlug = answers.slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      const replacements = {
        GAME_SLUG: answers.slug,
        GAME_NAME: answers.name,
        GAME_DESCRIPTION: answers.description,
        GAME_AUTHOR: answers.author,
        GAME_CAPITALIZED_SLUG: capitalizedSlug,
        GAME_TYPE: answers.type === 'r3f' ? '3D' : '2D'
      };

      // 6. Recursively process and replace placeholders in target directory
      const processDirectory = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            processDirectory(fullPath);
          } else {
            // Replace placeholders in file content
            let content = fs.readFileSync(fullPath, 'utf8');
            for (const [key, val] of Object.entries(replacements)) {
              content = content.replaceAll(`{{${key}}}`, val);
            }
            fs.writeFileSync(fullPath, content, 'utf8');

            // Handle filename replacements and template extension removal
            let newFile = file;
            for (const [key, val] of Object.entries(replacements)) {
              newFile = newFile.replaceAll(`{{${key}}}`, val);
            }
            if (newFile.endsWith('.tmpl')) {
              newFile = newFile.slice(0, -5);
            }
            const newPath = path.join(dir, newFile);
            if (newPath !== fullPath) {
              fs.renameSync(fullPath, newPath);
            }
          }
        }
      };

      processDirectory(targetDir);

      // 7. If game is 3D R3F, update package.json with extra peer dependencies
      const pkgPath = path.join(targetDir, 'package.json');
      const pkg = fs.readJsonSync(pkgPath);
      if (answers.type === 'r3f') {
        pkg.peerDependencies = {
          ...pkg.peerDependencies,
          "@react-three/drei": "^10.0.0",
          "@react-three/fiber": "^9.0.0",
          "@react-three/rapier": "^2.0.0",
          "gsap": "^3.0.0",
          "three": "^0.180.0"
        };
      }
      fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

      // 8. Generate Local README with clear instructions
      const readmeContent = `# @zenith/${answers.slug}

This game module was scaffolded using the Custom Game SDK CLI.

## Manual Integration Steps

To fully wire this game into the Zenith Protocol monorepo, follow these steps:

### 1. Register the Game Result Types
Open [packages/game-sdk/src/types.ts](file:///packages/game-sdk/src/types.ts) and add the following lines:

\`\`\`typescript
// 1. Add these interfaces:
export interface ${capitalizedSlug}Metadata {
  score: number;
  completedAt: string;
}

export interface ${capitalizedSlug}GameResult {
  gameId: '${answers.slug}';
  userId?: string;
  score: number;
  metadata: ${capitalizedSlug}Metadata;
  completedAt: string;
}

// 2. Extend the GameResult union type by adding ${capitalizedSlug}GameResult:
export type GameResult =
  | DojoGameResult
  | RunnerGameResult
  | CardBattlerGameResult
  | ${capitalizedSlug}GameResult;
\`\`\`

### 2. Register with the Web App plugin system
Open [apps/web/src/lib/pluginLoader.ts](file:///apps/web/src/lib/pluginLoader.ts) and register the lazy-loaded component in \`gameComponents\`:

\`\`\`typescript
const gameComponents: Record<string, ReturnType<typeof lazy>> = {
  // ...
  '${answers.slug}': lazy(() => import('@games/${answers.slug}/src/index') as Promise<{ default: ComponentType<unknown> }>),
};
\`\`\`

### 3. Register in main.tsx
Open [apps/web/src/main.tsx](file:///apps/web/src/main.tsx) and call \`registerGame\` at the bottom:

\`\`\`typescript
registerGame({
  id: '${answers.slug}',
  name: '${answers.name}',
  description: '${answers.description}',
  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
  route: '/play/${answers.slug}',
  component: '${capitalizedSlug}Module',
  minPlayers: 1,
  maxPlayers: 1,
  tags: ['${answers.type === 'r3f' ? '3D' : '2D'}', '${answers.type.toUpperCase()}']
});
\`\`\`

### 4. Splitting rollup chunk (Optional)
Open [apps/web/vite.config.ts](file:///apps/web/vite.config.ts) and add the manual chunk split:

\`\`\`typescript
        manualChunks: (id) => {
          if (id.includes('games/${answers.slug}')) return 'game-${answers.slug}';
          // ...
\`\`\`
`;
      fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent, 'utf8');

      spinner.succeed(chalk.green('Game module scaffolded successfully!'));

      // 9. Run pnpm install to wire up packages
      console.log(chalk.cyan('\nLinking package via pnpm install...'));
      try {
        execSync('pnpm install', { cwd: workspaceRoot, stdio: 'inherit' });
        console.log(chalk.green('Workspace dependencies linked successfully!'));
      } catch (err) {
        console.log(chalk.yellow('\nWarning: Auto pnpm install failed. Please run "pnpm install" manually at the root to wire up the new workspace module.'));
      }

      console.log(chalk.bold.green('\n Scaffolding Complete!\n'));
      console.log(`Your game has been created at: ${chalk.cyan(`games/${answers.slug}`)}`);
      console.log(`Please follow the manual wiring instructions detailed in: ${chalk.cyan(`games/${answers.slug}/README.md`)}`);
      console.log(`To run the project, execute: ${chalk.cyan('pnpm dev:web')}\n`);

    } catch (error) {
      spinner.fail(chalk.red('Failed to scaffold game module.'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv);
