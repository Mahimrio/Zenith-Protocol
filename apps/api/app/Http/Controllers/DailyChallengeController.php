<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\DailyChallenge;
use App\Models\UserChallenge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DailyChallengeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today('UTC')->toDateString();
        $resetsAt = Carbon::tomorrow('UTC')->toIso8601String();

        $challenges = DailyChallenge::whereDate('date', Carbon::today('UTC'))->get();

        $userProgress = UserChallenge::whereIn('challenge_id', $challenges->pluck('id'))
            ->where('user_id', $user->id)
            ->get()
            ->keyBy('challenge_id');

        $result = $challenges->map(function ($challenge) use ($userProgress): array {
            $userChallenge = $userProgress->get($challenge->id);

            return [
                'id' => $challenge->id,
                'game_id' => $challenge->game_id,
                'challenge_type' => $challenge->challenge_type,
                'title' => $challenge->title,
                'description' => $challenge->description,
                'target_value' => $challenge->target_value,
                'reward_points' => $challenge->reward_points,
                'completed' => $userChallenge?->completed_at !== null,
                'progress_value' => $userChallenge?->progress_value ?? 0,
            ];
        });

        $totalEarnedToday = UserChallenge::whereIn('challenge_id', $challenges->pluck('id'))
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->join('daily_challenges', 'user_challenges.challenge_id', '=', 'daily_challenges.id')
            ->sum('daily_challenges.reward_points');

        return response()->json([
            'challenges' => $result,
            'resets_at' => $resetsAt,
            'total_earned_today' => (int) $totalEarnedToday,
        ]);
    }
}
