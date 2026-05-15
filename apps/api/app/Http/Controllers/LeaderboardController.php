<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\LeaderboardEntryResource;
use App\Repositories\LeaderboardRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Serves paginated leaderboard data with per-user rank metadata.
 *
 * Response includes:
 *  - data: top N entries (default/max 100)
 *  - meta: game_id, authenticated user's personal rank/score, timestamp
 *
 * Cached for 60s per game+limit key. Cache is busted by score services
 * on each new validated submission.
 */
class LeaderboardController extends Controller {
    public function index(Request $request, LeaderboardRepositoryInterface $repository): JsonResponse {
        $gameId = $request->query('game', 'dojo-3d');
        $limit  = min((int) $request->query('limit', '100'), 100);
        $user   = $request->user();

        $cacheKey    = "leaderboard_{$gameId}_{$limit}";
        $leaderboard = Cache::remember($cacheKey, 60, function () use ($repository, $gameId, $limit) {
            return $repository->getTopScores($gameId, $limit);
        });

        // Assign computed rank based on sorted position (avoids static counter bugs)
        $leaderboard->values()->each(function ($entry, int $index) {
            $entry->computed_rank = $index + 1;
        });

        // Authenticated user's personal rank (even if outside top N)
        $yourRank  = null;
        $yourScore = null;
        if ($user) {
            $yourRank  = $repository->getUserRank($gameId, (string) $user->id);
            $yourScore = $repository->getUserBestScore($gameId, (string) $user->id);
            // getUserRank returns 0 when user has no scores
            $yourRank  = $yourRank > 0 ? $yourRank : null;
        }

        return response()->json([
            'data' => LeaderboardEntryResource::collection($leaderboard),
            'meta' => [
                'game_id'      => $gameId,
                'your_rank'    => $yourRank,
                'your_score'   => $yourScore,
                'generated_at' => now()->toISOString(),
            ],
        ]);
    }
}
