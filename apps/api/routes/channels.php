<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| leaderboard.{gameId} is a PUBLIC channel — no authorization required.
|
| user.{userId} — Private channel for real-time achievement notifications.
| Only the authenticated user matching userId can subscribe.
*/

Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
