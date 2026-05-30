# FIX C1_C2_C3 — Security & Correctness: Auth channel, hardcoded creds, autocomplete

**Category:** Auth/Security, Real-Time, HTML Best Practices

---

## C1 — channels.php: Add private channel auth callback

**File:** `apps/api/routes/channels.php`

**Problem:** File contained only comments — no actual `Broadcast::channel()` callbacks. The `user.{userId}` private channel had no auth callback, so `useEcho` subscriptions for achievement real-time notifications would always fail (403). The frontend code `useAchievements.ts` subscribes to `private-user.{userId}` — it was silently broken.

**Fix:** Replaced entire file with a proper `Broadcast::channel('user.{userId}', ...)` callback that verifies `(int) $user->id === (int) $userId`.

---

## C2 — Remove hardcoded credentials from LoginPage

**File:** `apps/web/src/pages/LoginPage.tsx`

**Problem:** `useState('admin@gamehub.com')` and `useState('password')` pre-filled the login form with hardcoded test credentials. This is a security anti-pattern — it leaks the email format and encourages weak passwords in production.

**Fix:** Changed both to empty strings: `useState('')`.

---

## C3 — Add autocomplete attributes to password fields

**Files:**
- `apps/web/src/pages/LoginPage.tsx` — password input
- `apps/web/src/pages/RegisterPage.tsx` — password + confirm password inputs

**Problem:** Password inputs lacked `autoComplete` attributes, preventing password managers from suggesting/autofilling credentials.

**Fix:**
- LoginPage: `autoComplete="current-password"` on the password field
- RegisterPage: `autoComplete="new-password"` on both password and confirmation fields

These are standard HTML attributes that enable browser password manager integration.

## Verification

- ✅ `pnpm build` succeeds (752 modules, 0 errors)
- ✅ PHP autoload loads without error
- ✅ No hardcoded credentials remain in production code
- ✅ All 3 password fields now have correct `autoComplete` attributes
