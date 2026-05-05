<?php
declare(strict_types=1);

namespace App\Repositories;

use Illuminate\Support\Collection;

interface LeaderboardRepositoryInterface {
    public function getTopScores(string $gameId, int $limit = 100): Collection;
    public function getUserRank(string $gameId, string $userId): int;
}
