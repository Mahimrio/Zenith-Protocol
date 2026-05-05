<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DojoController;
use App\Http\Controllers\CardBattlerController;
use App\Http\Controllers\RunnerController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\UserSessionController;
use App\Http\Controllers\AuthController;

Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/games/dojo/sessions', [DojoController::class, 'store'])->middleware('throttle:score-submit');
    Route::post('/games/card/sessions', [CardBattlerController::class, 'initSession'])->middleware('throttle:score-submit');
    Route::post('/games/card/moves', [CardBattlerController::class, 'playMove']);
    Route::post('/games/runner/sessions', [RunnerController::class, 'store'])->middleware('throttle:score-submit');
    
    Route::get('/leaderboards', [LeaderboardController::class, 'index'])->middleware('throttle:60,1');
    Route::get('/user/sessions', [UserSessionController::class, 'index']);
});
