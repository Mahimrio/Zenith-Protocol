<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\GameSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DojoScoreService {
    public function validateAndSave(User $user, array $data): GameSession {
        return DB::transaction(function () use ($user, $data) {
            if ($data['survival_ms'] <= 0 || $data['survival_ms'] > 7200000) {
                abort(422, 'Invalid survival time.');
            }

            $basePoints = 10;
            $waveBonus = $data['waves_survived'] * 50;
            $expectedScore = ($data['enemies_killed'] * $basePoints) + $waveBonus;

            $diff = abs($data['score'] - $expectedScore);
            if ($expectedScore > 0 && ($diff / $expectedScore) > 0.05) {
                Log::warning('Suspicious Dojo Score', ['user' => $user->id, 'data' => $data]);
                abort(422, 'Score validation failed.');
            }

            if ($data['max_combo'] > $data['enemies_killed']) {
                abort(422, 'Invalid combo.');
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
    }
}
