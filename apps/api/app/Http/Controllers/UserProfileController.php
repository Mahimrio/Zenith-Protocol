<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\GameSession;
use App\Http\Resources\UserResource;
use App\Http\Resources\SessionHistoryResource;
use App\Repositories\LeaderboardRepositoryInterface;

class UserProfileController extends Controller
{
    private LeaderboardRepositoryInterface $leaderboardRepo;

    public function __construct(LeaderboardRepositoryInterface $leaderboardRepo)
    {
        $this->leaderboardRepo = $leaderboardRepo;
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $stats = GameSession::where('user_id', $user->id)
            ->whereNotNull('server_validated_at')
            ->leftJoin('dojo_sessions', 'game_sessions.id', '=', 'dojo_sessions.session_id')
            ->leftJoin('card_sessions', 'game_sessions.id', '=', 'card_sessions.session_id')
            ->leftJoin('runner_sessions', 'game_sessions.id', '=', 'runner_sessions.session_id')
            ->selectRaw('
                game_id, 
                COUNT(*) as total_sessions, 
                MAX(score) as best_score,
                MAX(dojo_sessions.waves_survived) as best_wave,
                MAX(card_sessions.turns_survived) as best_turns,
                MAX(runner_sessions.distance_meters) as best_distance,
                MAX(runner_sessions.peak_speed) as best_speed
            ')
            ->groupBy('game_id')
            ->get()
            ->mapWithKeys(fn($s) => [$s->game_id => $s]);

        return response()->json([
            'user' => new UserResource($user),
            'stats' => [
                'dojo-3d' => isset($stats['dojo-3d']) ? [
                    'total_sessions' => (int) $stats['dojo-3d']->total_sessions,
                    'best_score' => (int) $stats['dojo-3d']->best_score,
                    'best_wave' => (int) $stats['dojo-3d']->best_wave,
                ] : null,
                'card-battler' => isset($stats['card-battler']) ? [
                    'total_sessions' => (int) $stats['card-battler']->total_sessions,
                    'best_score' => (int) $stats['card-battler']->best_score,
                    'best_turns' => (int) $stats['card-battler']->best_turns,
                ] : null,
                'cyber-runner' => isset($stats['cyber-runner']) ? [
                    'total_sessions' => (int) $stats['cyber-runner']->total_sessions,
                    'best_score' => (int) $stats['cyber-runner']->best_score,
                    'best_distance' => (int) $stats['cyber-runner']->best_distance,
                    'best_speed' => (int) $stats['cyber-runner']->best_speed,
                ] : null,
            ],
            'global_ranks' => [
                'dojo-3d' => $this->leaderboardRepo->getUserRank('dojo-3d', $user->id) ?: null,
                'card-battler' => $this->leaderboardRepo->getUserRank('card-battler', $user->id) ?: null,
                'cyber-runner' => $this->leaderboardRepo->getUserRank('cyber-runner', $user->id) ?: null,
            ],
        ]);
    }

    public function sessions(Request $request): JsonResponse
    {
        $sessions = GameSession::where('user_id', $request->user()->id)
            ->whereNotNull('server_validated_at')
            ->when($request->game, fn($q) => $q->where('game_id', $request->game))
            ->with(['dojoSession', 'runnerSession', 'cardSession'])
            ->orderBy('completed_at', 'desc')
            ->paginate(15);

        return SessionHistoryResource::collection($sessions)->response();
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|max:2048|mimes:jpg,jpeg,png,webp',
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store("avatars/{$user->id}", 'public');

        $user->update(['avatar_url' => '/storage/' . $path]);

        return response()->json(new UserResource($user));
    }
}
