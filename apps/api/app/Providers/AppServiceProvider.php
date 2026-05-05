<?php
declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use App\Repositories\LeaderboardRepositoryInterface;
use App\Repositories\EloquentLeaderboardRepository;

class AppServiceProvider extends ServiceProvider {
    public function register(): void {
        $this->app->bind(LeaderboardRepositoryInterface::class, EloquentLeaderboardRepository::class);
    }

    public function boot(): void {
        RateLimiter::for('score-submit', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });
    }
}
