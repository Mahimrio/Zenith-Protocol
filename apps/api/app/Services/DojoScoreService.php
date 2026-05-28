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

class DojoScoreService {
    public function validateAndSave(User $user, array $data): GameSession {
        $session = DB::transaction(function () use ($user, $data) {
            if ($data['survival_ms'] <= 0 || $data['survival_ms'] > 7200000) {
                abort(422, 'Invalid survival time.');
            }

            if ($data['max_combo'] > $data['enemies_killed']) {
                abort(422, 'Invalid combo.');
            }

            // Recalculate expected score using same formula as frontend:
            // scorePerKill(wave) = floor(100 * (1 + wave * 0.2))
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

            // Allow 2.5x multiplier for combos + rounding tolerance
            $ceiling = $expectedScore * 2.5;

            if ($data['score'] > $ceiling) {
                // Hard-reject extreme outliers only
                if ($data['score'] > $ceiling * 3) {
                    Log::warning('Dojo score implausible', ['user' => $user->id, 'data' => $data, 'expected_ceiling' => $ceiling]);
                    abort(422, 'Score implausible.');
                }
                Log::warning('Suspicious dojo score', [
                    'user_id' => $user->id,
                    'score' => $data['score'],
                    'expected_ceiling' => $ceiling,
                ]);
            }

            $session = GameSession::create([
                'user_id' => $user->id,
                'game_id' => 'dojo-3d',
                'score' => $data['score'],
                'metadata' => ['combo' => $data['max_combo']],
                'server_validated_at' => now(),
                'started_at' => now()->subMilliseconds($data['survival_ms']),
                'completed_at' => now()
            ]);

            $session->dojoSession()->create([
                'waves_survived' => $data['waves_survived'],
                'enemies_killed' => $data['enemies_killed'],
                'max_combo' => $data['max_combo'],
                'survival_ms' => $data['survival_ms']
            ]);

            $user->increment('total_score', $data['score']);
            $user->increment('games_played');

            return $session;
        });

        // Broadcast after transaction commits — calculate new rank
        $rank = GameSession::where('game_id', 'dojo-3d')
            ->whereNotNull('server_validated_at')
            ->where('score', '>', $session->score)
            ->count() + 1;

        Cache::forget('leaderboard_dojo-3d');

        broadcast(new ScoreSubmitted('dojo-3d', $rank, $user, $session->score))->toOthers();

        // Dispatch achievement check after the transaction commits
        CheckAchievements::dispatch($user->id, $session->id)->afterCommit();

        // Check daily challenges
        app(ChallengeCompletionService::class)->checkAndComplete($user, $session);

        return $session;
    }
}
