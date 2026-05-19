<?php
declare(strict_types=1);

namespace App\Services;

use App\Events\ScoreSubmitted;
use App\Jobs\CheckAchievements;
use App\Models\GameSession;
use App\Models\User;
use App\Services\ChallengeCompletionService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RunnerScoreService {
    public function validateAndSave(User $user, array $data): GameSession {
        $session = DB::transaction(function () use ($user, $data) {
            $maxTheoreticalDistance = 100000;
            if ($data['distance_meters'] > $maxTheoreticalDistance) {
                abort(422, 'Impossible distance.');
            }

            $maxPeakSpeed = 280 + (200 * 15);
            if ($data['peak_speed'] > $maxPeakSpeed) {
                abort(422, 'Impossible speed.');
            }

            $session = GameSession::create([
                'user_id' => $user->id,
                'game_id' => 'cyber-runner',
                'score' => $data['distance_meters'],
                'metadata' => ['obstacles' => $data['obstacles_avoided']],
                'server_validated_at' => now(),
                'started_at' => now(),
                'completed_at' => now()
            ]);

            $session->runnerSession()->create([
                'distance_meters' => $data['distance_meters'],
                'peak_speed' => $data['peak_speed'],
                'obstacles_avoided' => $data['obstacles_avoided']
            ]);

            $user->increment('total_score', $data['distance_meters']);
            $user->increment('games_played');

            return $session;
        });

        // Broadcast after transaction commits — calculate new rank
        $rank = GameSession::where('game_id', 'cyber-runner')
            ->whereNotNull('server_validated_at')
            ->where('score', '>', $session->score)
            ->count() + 1;

        Cache::forget('leaderboard_cyber-runner');

        broadcast(new ScoreSubmitted('cyber-runner', $rank, $user, $session->score))->toOthers();

        // Dispatch achievement check after the transaction commits
        CheckAchievements::dispatch($user->id, $session->id)->afterCommit();

        // Check daily challenges
        app(ChallengeCompletionService::class)->checkAndComplete($user, $session);

        return $session;
    }
}
