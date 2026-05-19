<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\DailyChallenge;
use App\Models\GameSession;
use App\Models\User;
use App\Models\UserChallenge;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ChallengeCompletionService
{
    /**
     * Check and complete today's challenges for the given session.
     *
     * @return array<int, array{challenge_id: int, reward_points: int}>
     */
    public function checkAndComplete(User $user, GameSession $session): array
    {
        $today = Carbon::today('UTC')->toDateString();

        $challenges = DailyChallenge::whereDate('date', Carbon::today('UTC'))
            ->where('game_id', $session->game_id)
            ->get();

        if ($challenges->isEmpty()) {
            return [];
        }

        $completed = [];

        foreach ($challenges as $challenge) {
            $userChallenge = UserChallenge::firstOrCreate(
                ['user_id' => $user->id, 'challenge_id' => $challenge->id],
                ['progress_value' => 0, 'completed_at' => null]
            );

            if ($userChallenge->completed_at !== null) {
                continue;
            }

            $progress = $this->extractProgress($session, $challenge->challenge_type);

            if ($progress === null) {
                continue;
            }

            $userChallenge->update(['progress_value' => $progress]);

            if ($this->meetsTarget($progress, $challenge)) {
                DB::transaction(function () use ($user, $challenge, $userChallenge, &$completed): void {
                    $userChallenge->update(['completed_at' => now()]);
                    $user->increment('total_score', $challenge->reward_points);

                    $completed[] = [
                        'challenge_id' => $challenge->id,
                        'reward_points' => $challenge->reward_points,
                    ];
                });
            }
        }

        return $completed;
    }

    private function extractProgress(GameSession $session, string $challengeType): ?int
    {
        return match ($challengeType) {
            'min_score' => (int) $session->score,
            'min_wave' => $session->dojoSession?->waves_survived,
            'min_distance' => $session->runnerSession?->distance_meters,
            'win_in_turns' => $session->cardSession?->turns_survived,
            default => null,
        };
    }

    private function meetsTarget(int $progress, DailyChallenge $challenge): bool
    {
        return match ($challenge->challenge_type) {
            'min_score', 'min_wave', 'min_distance' => $progress >= $challenge->target_value,
            'win_in_turns' => $progress <= $challenge->target_value,
            default => false,
        };
    }
}
