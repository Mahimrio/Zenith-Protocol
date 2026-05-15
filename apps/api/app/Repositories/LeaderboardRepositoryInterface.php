<?php
declare(strict_types=1);

namespace App\Repositories;

use Illuminate\Support\Collection;

interface LeaderboardRepositoryInterface {
    public function getTopScores(string $gameId, int $limit = 100): Collection;
    public function getUserRank(string $gameId, string $userId): int;

    /**
     * Get the user's highest validated score for a specific game.
     * Returns null if the user has no scores for this game.
     */
    public function getUserBestScore(string $gameId, string $userId): ?int;
}
