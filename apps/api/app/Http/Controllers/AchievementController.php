<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    /**
     * List the authenticated user's achievements, grouped by game_id,
     * showing both unlocked and locked achievements with progress %.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $unlockedIds = UserAchievement::where('user_id', $user->id)
            ->pluck('achievement_id')
            ->toArray();

        $allAchievements = Achievement::all()->groupBy(fn ($a) => $a->game_id ?? 'global');

        $groups = [];

        foreach ($allAchievements as $gameId => $achievements) {
            $items = $achievements->map(function (Achievement $a) use ($unlockedIds, $user) {
                $isUnlocked = in_array($a->id, $unlockedIds, true);

                return [
                    'slug'        => $a->slug,
                    'name'        => $a->name,
                    'description' => $a->description,
                    'icon'        => $a->icon,
                    'game_id'     => $a->game_id,
                    'unlocked'    => $isUnlocked,
                    'progress'    => $isUnlocked
                        ? 100
                        : $this->computeProgress($a, $user),
                ];
            });

            $groups[] = [
                'game_id'        => $gameId,
                'achievements'   => $items->values()->all(),
                'total'          => $items->count(),
                'unlocked_count' => $items->where('unlocked', true)->count(),
            ];
        }

        return response()->json(['data' => $groups]);
    }

    /**
     * Compute progress percentage for a locked achievement.
     */
    private function computeProgress(Achievement $achievement, $user): int
    {
        return match ($achievement->condition_type) {
            'games_played'    => min(100, (int) (($user->games_played / $achievement->condition_value) * 100)),
            'score_threshold' => 0,
            'distance'        => 0,
            'wave_reached'    => 0,
            'turns_survived'  => 0,
            default           => 0,
        };
    }
}
