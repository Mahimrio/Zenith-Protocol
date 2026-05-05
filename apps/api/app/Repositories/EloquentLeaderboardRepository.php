<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Models\GameSession;
use Illuminate\Support\Collection;

class EloquentLeaderboardRepository implements LeaderboardRepositoryInterface {
    public function getTopScores(string $gameId, int $limit = 100): Collection {
        return GameSession::query()
            ->where('game_id', $gameId)
            ->whereNotNull('server_validated_at')
            ->with('user:id,name,avatar_url')
            ->orderByDesc('score')
            ->limit($limit)
            ->select(['id', 'user_id', 'score', 'completed_at', 'metadata'])
            ->get();
    }

    public function getUserRank(string $gameId, string $userId): int {
        $userScore = GameSession::query()
            ->where('game_id', $gameId)
            ->where('user_id', $userId)
            ->whereNotNull('server_validated_at')
            ->max('score');

        if (!$userScore) {
            return 0;
        }

        return GameSession::query()
            ->where('game_id', $gameId)
            ->whereNotNull('server_validated_at')
            ->where('score', '>', $userScore)
            ->count() + 1;
    }
}
