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

class CardScoreService {
    public function validateAndSave(User $user, array $data): GameSession {
        $session = DB::transaction(function () use ($user, $data) {
            $turnsSurvived = $data['turns_survived'];
            $cardsPlayed = $data['cards_played'];
            $finalScore = $data['final_score'];

            // Validate score plausibility: turn base (50 pts) + card cost * 10 per card + victory (500)
            // Frontend: score += card.cost * 10 per card played; max cost is 9 (Obliterate)
            $maxCostPerCard = 9;
            $expectedCeiling = ($turnsSurvived * 50)
                + ($cardsPlayed * $maxCostPerCard * 10)
                + 500; // victory bonus

            // Allow 1.2x tolerance for rounding
            if ($finalScore > $expectedCeiling * 1.2) {
                if ($finalScore > $expectedCeiling * 3) {
                    Log::warning('Card score implausible', ['user' => $user->id, 'data' => $data, 'expected_ceiling' => $expectedCeiling]);
                    abort(422, 'Score implausible.');
                }
                Log::warning('Suspicious card score', [
                    'user_id' => $user->id,
                    'score' => $finalScore,
                    'expected_ceiling' => $expectedCeiling,
                ]);
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

        // Broadcast after transaction commits — calculate new rank
        $rank = GameSession::where('game_id', 'card-battler')
            ->whereNotNull('server_validated_at')
            ->where('score', '>', $session->score)
            ->count() + 1;

        Cache::forget('leaderboard_card-battler');

        broadcast(new ScoreSubmitted('card-battler', $rank, $user, $session->score))->toOthers();

        // Dispatch achievement check after the transaction commits
        CheckAchievements::dispatch($user->id, $session->id)->afterCommit();

        // Check daily challenges
        app(ChallengeCompletionService::class)->checkAndComplete($user, $session);

        return $session;
    }
}
