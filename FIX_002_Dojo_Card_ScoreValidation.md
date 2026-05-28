# FIX 002 — Dojo & Card Battler Score Validation

> **Date:** 2026-05-28
> **Status:** ✅ Fixed — 11/11 Pest tests passing

---

## Problem

Both Dojo and Card Battler scores were **always rejected** by the backend with `422` validation errors because the backend's expected score ceilings did not match what the frontend actually calculates.

### Dojo Score Mismatch

**Frontend formula:**
```javascript
scoreForKill(wave, type) = floor(base * (1 + wave * 0.2))
// base = 100 for standard enemy
// Wave 1: 100 * 1.2 = 120 per kill
// 3 kills in wave 1 = 360 points minimum
```

**Old backend ceiling (always rejected):**
```php
$basePoints = 10;
$waveBonus = $data['waves_survived'] * 50;
$expectedScore = ($data['enemies_killed'] * $basePoints) + $waveBonus;
// Wave 1, 3 kills: 3 * 10 + 50 = 80
// 80 * 1.05 (tolerance) = 84
// Frontend score 360 > 84 → REJECTED
```

### Card Score Mismatch

**Frontend formula:**
```javascript
score += card.cost * 10   // per card played (cost ranges from 1–9)
score += turnsSurvived * 50
score += 500 if victory
```

**Old backend ceiling (always rejected):**
```php
$expectedCeiling = ($turnsSurvived * 50) + ($cardsPlayed * 10);
// A cost-9 card gives 90 pts to frontend but backend only allows 10
// → ALWAYS rejected for any card costing > 1
```

---

## Files Changed

| File | Change |
|------|--------|
| `apps/api/app/Services/DojoScoreService.php` | Replaced naive formula with frontend-aligned wave-based score calculation |
| `apps/api/app/Services/CardScoreService.php` | Updated ceiling to use max cost per card (9) + victory bonus (500) |
| `apps/api/tests/Feature/DojoScoreServiceTest.php` | Updated assertion message to match new abort text |

---

## Fix Details

### DojoScoreService — New Validation

The server now recalculates using the **same formula as the frontend**:

```php
$expectedScore = 0;
$remainingKills = $data['enemies_killed'];
if ($data['waves_survived'] > 0) {
    $killsPerWave = (int) ceil($remainingKills / $data['waves_survived']);
    for ($w = 1; $w <= $data['waves_survived']; $w++) {
        $waveKills = min($killsPerWave, $remainingKills);
        $scorePerKill = (int) floor(100 * (1 + $w * 0.2));
        $expectedScore += $waveKills * $scorePerKill;
        $remainingKills -= $waveKills;
        if ($remainingKills <= 0) break;
    }
} else {
    $expectedScore = $data['enemies_killed'] * 100;
}

$ceiling = $expectedScore * 2.5;
```

- Scores exceeding `3× ceiling` are hard-rejected as implausible
- Scores between `1× ceiling` and `3× ceiling` are logged as suspicious but **accepted**

### CardScoreService — New Validation

The server now uses a cost-aware ceiling:

```php
$maxCostPerCard = 9;
$expectedCeiling = ($turnsSurvived * 50)
    + ($cardsPlayed * $maxCostPerCard * 10)
    + 500;

if ($finalScore > $expectedCeiling * 1.2) {
    if ($finalScore > $expectedCeiling * 3) {
        abort(422, 'Score implausible.');
    }
    Log::warning('Suspicious card score', [...]);
}
```

---

## Verification

```
php artisan test
  ✓ 11/11 tests passing (including all 3 DojoScoreService tests)
```
