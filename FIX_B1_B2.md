# FIX B1_B2 — Post-Audit Cleanup: Debug log & .env.example

**Priority:** P2 — Real Problem
**Category:** C9 (TypeScript & Build Health) / C12 (CI/CD & Deployment Readiness)

---

## B1 — Remove debug console.log from GameCanvas

**File:** `games/cyber-runner/src/components/GameCanvas.tsx:125`

**Problem:** `console.log('COLLISION DETECTED', pHitbox, oHitbox)` leaked internal game coordinates to the browser console on every collision. This was debug scaffolding left in production code.

**Fix:** Removed the `console.log` line. The surrounding collision detection and game-over logic remain intact.

---

## B2 — Fix .env.example VITE_API_URL + add VITE_REVERB_SCHEME

**File:** `apps/web/.env.example`

**Problem 1:** `VITE_API_URL=http://localhost:8000/api` pointed directly at the backend, but the actual `.env` uses `/api` (the Vite proxy path). New developers copying the example verbatim would get CORS errors since requests bypass the proxy.

**Fix:** Changed to `VITE_API_URL=/api` to match the actual `.env` and the Vite proxy config.

**Problem 2:** Missing `VITE_REVERB_SCHEME` variable — the actual `.env` has it, the `.env.example` didn't.

**Fix:** Added `VITE_REVERB_SCHEME=http` after the `VITE_REVERB_PORT` line.

Also updated `VITE_APP_NAME` from `GameHub` to `ZenithOS` to match the actual `.env`.

## Verification

- ✅ `pnpm build` succeeds (752 modules, 0 errors)
- ✅ No `console.log` remains in production code (confirmed via grep)
