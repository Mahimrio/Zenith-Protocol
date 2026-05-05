<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\LeaderboardResource;
use App\Repositories\LeaderboardRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller {
    public function index(Request $request, LeaderboardRepositoryInterface $repository): JsonResponse {
        $gameId = $request->query('game', 'dojo-3d');
        
        $leaderboard = Cache::remember("leaderboard_{$gameId}", 60, function () use ($repository, $gameId) {
            return $repository->getTopScores($gameId);
        });

        return response()->json(new LeaderboardResource($leaderboard));
    }
}
