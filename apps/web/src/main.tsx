/**
 * @file main.tsx
 * @description Host App entry point.
 */
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';
import { registerGame } from './lib/pluginLoader';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with update handling
registerSW({
  onNeedRefresh() {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 backdrop-blur-md';
    toast.style.cssText = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);';
    toast.innerHTML = `
      <span style="color: #f0f0ff; font-size: 14px; font-family: sans-serif;">Update available — refresh</span>
      <button id="sw-refresh-btn" style="
        background: transparent;
        border: 1px solid rgba(255,255,255,0.2);
        color: #f0f0ff;
        padding: 4px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-family: sans-serif;
        transition: all 0.2s;
      ">Refresh</button>
    `;
    document.body.appendChild(toast);

    const btn = document.getElementById('sw-refresh-btn');
    btn?.addEventListener('click', () => {
      window.location.reload();
    });
  },
  onOfflineReady() {
    // PWA ready — handled silently
  },
});

// Register available game modules
registerGame({
  id: 'dojo-3d',
  name: 'Dojo 3D',
  description: 'An immersive 3D survival game. Fight waves of enemies in an ancient dojo.',
  thumbnail: '/images/dojo-banner.png',
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
  thumbnail: '/images/card-banner.png',
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
  thumbnail: '/images/runner-banner.png',
  route: '/play/cyber-runner',
  component: 'CyberRunnerModule',
  minPlayers: 1,
  maxPlayers: 1,
  tags: ['2D', 'Arcade', 'Endless']
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
);
