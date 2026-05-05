/**
 * @file main.tsx
 * @description Host App entry point.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';
import { registerGame } from './lib/pluginLoader';

// Register available game modules
registerGame({
  id: 'dojo-3d',
  name: 'Dojo 3D',
  description: 'An immersive 3D survival game. Fight waves of enemies in an ancient dojo.',
  thumbnail: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=600',
  route: '/play/dojo-3d',
  component: 'Dojo3DModule',
  minPlayers: 1,
  maxPlayers: 1,
  tags: ['3D', 'Action', 'Survival']
});

registerGame({
  id: 'card-battler',
  name: 'Tactical Card Battler',
  description: 'A strategic 2D card battler where you build decks and conquer opponents.',
  thumbnail: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=600',
  route: '/play/card-battler',
  component: 'CardBattlerModule',
  minPlayers: 1,
  maxPlayers: 2,
  tags: ['2D', 'Strategy', 'Cards']
});

registerGame({
  id: 'cyber-runner',
  name: 'Cyber Runner',
  description: 'A fast-paced neon infinite runner. Dodge obstacles and set high scores.',
  thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
  route: '/play/cyber-runner',
  component: 'CyberRunnerModule',
  minPlayers: 1,
  maxPlayers: 1,
  tags: ['2D', 'Arcade', 'Endless']
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
