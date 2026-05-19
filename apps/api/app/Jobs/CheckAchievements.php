<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Models\GameSession;
use App\Models\User;
use App\Services\AchievementService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckAchievements implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $userId,
        public readonly string $sessionId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AchievementService $service): void
    {
        $user = User::find($this->userId);
        $session = GameSession::find($this->sessionId);

        if (! $user || ! $session) {
            return;
        }

        $service->check($user, $session);
    }
}
