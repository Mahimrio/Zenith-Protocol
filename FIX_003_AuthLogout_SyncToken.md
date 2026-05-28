# FIX 003 — Auth Logout Server Revocation & PWA Sync Token Key

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — TypeScript clean, build succeeds (0 errors, 501 modules)

---

## Problems

### 1. Logout never revokes server token (security gap)

The `logout()` action in `authStore.ts` only removed the token from `localStorage` and cleared local state — it **never called `POST /api/auth/logout`**. The Sanctum token on the server stayed valid indefinitely, meaning a leaked token could be used after the user thought they had logged out.

**Old code (WRONG):**
```typescript
logout: () => {
  localStorage.removeItem('token');
  set({ user: null, token: null, isAuthenticated: false, error: null });
},
```

### 2. PWA sync uses wrong localStorage key (offline queue never flushes)

The `syncWorker.ts` read the auth token using `'zenith-auth-token'`, but `authStore.ts` saves it under the key `'token'`. This meant `flushQueue()` always got `null` as the token, so all queued offline scores silently failed to submit when the user reconnected.

**Old code (WRONG):**
```typescript
const token = localStorage.getItem('zenith-auth-token');
```

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/src/store/authStore.ts` | `logout()` now async — calls `POST /api/auth/logout` (best-effort) before clearing local state |
| `apps/web/src/lib/axios.ts` | Added `void` prefix to async `logout()` call in 401 interceptor |
| `apps/web/src/components/SettingsModal.tsx` | `handleSignOut` → `async` with `await logout()` |
| `apps/web/src/pages/MenuPage.tsx` | `handleLogout` → `async` with `await logout()` |
| `apps/web/src/worker/syncWorker.ts` | `'zenith-auth-token'` → `'token'` |

---

## Fix Details

### authStore.ts — Server-side token revocation

```typescript
logout: async () => {
  const token = get().token ?? localStorage.getItem('token');
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    } catch {
      // Network error — still clear locally (best effort)
    }
  }
  localStorage.removeItem('token');
  set({ user: null, token: null, isAuthenticated: false, error: null });
},
```

- Network failures during logout don't block local cleanup
- Uses bare `fetch` (not axios) to avoid circular dependency

### syncWorker.ts — Fixed localStorage key

```typescript
// BEFORE
const token = localStorage.getItem('zenith-auth-token');
// AFTER
const token = localStorage.getItem('token');
```

---

## Verification

```
pnpm -C apps/web build
  ✓ TypeScript: 0 errors
  ✓ Build: 501 modules, all chunks generated
  ✓ PWA: sw.js + workbox generated
```
