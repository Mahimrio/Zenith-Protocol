<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\GameSession;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CardScoreService {
    public function validateAndSave(User $user, array $data): GameSession {
        return DB::transaction(function () use ($user, $data) {
            $turnsSurvived = $data['turns_survived'];
            $cardsPlayed = $data['cards_played'];
            $finalScore = $data['final_score'];

            // Validate score plausibility: each turn gives base 50 pts, each card played gives 10 pts
            $expectedCeiling = ($turnsSurvived * 50) + ($cardsPlayed * 10);
            if ($finalScore > $expectedCeiling * 1.10) {
                Log::warning('Suspicious Card Battler Score', ['user' => $user->id, 'data' => $data]);
                abort(422, 'Score validation failed.');
            }

            if ($cardsPlayed > $turnsSurvived * 5) {
                abort(422, 'Impossible card play count.');
            }

            $session = GameSession::create([
                'user_id' => $user->id,
                'game_id' => 'card-battler',
                'score' => $finalScore,
                'metadata' => ['turns' => $turnsSurvived, 'cards' => $cardsPlayed],
                'server_validated_at' => now(),
                'started_at' => now(),
                'completed_at' => now()
            ]);

            $session->cardSession()->create([
                'turns_survived' => $turnsSurvived,
                'cards_played' => $cardsPlayed,
                'cards_drawn' => max($cardsPlayed, $turnsSurvived),
                'final_enemy_hp' => 0
            ]);

            $user->increment('total_score', $finalScore);
            $user->increment('games_played');

            return $session;
        });
    }
}
