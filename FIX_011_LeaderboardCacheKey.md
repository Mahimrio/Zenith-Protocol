# FIX 011 — Leaderboard Cache Key Mismatch

**Priority:** P1 — Real Problem
**Category:** C4 (Score Submission Pipeline) / C8 (Backend Data Integrity)

---

## Problem

`LeaderboardController` cached with key `leaderboard_{gameId}_{limit}` (e.g. `leaderboard_dojo-3d_100`), but all three score services (`DojoScoreService`, `CardScoreService`, `RunnerScoreService`) forgot the key `leaderboard_{gameId}` (no `_{limit}` suffix). The keys didn't match, so `Cache::forget()` never found the cached entry. The leaderboard served stale data for the full 60-second TTL after every score submission.

## Fix

**File:** `apps/api/app/Http/Controllers/LeaderboardController.php:28`

Changed:
```php
$cacheKey = "leaderboard_{$gameId}_{$limit}";
```
To:
```php
$cacheKey = "leaderboard_{$gameId}";
```

The `$limit` variable is still used inside the `Cache::remember` callback for the actual database query — only the cache key name was wrong. No other files needed changes; the score services already forget `leaderboard_{gameId}`.

## Verification

- ✅ All 11 Pest tests pass (15 assertions)
- ✅ Cache key now matches the key used by `Cache::forget()` in all 3 score services
- ✅ Leaderboard busts immediately on every validated score submission
