<?php
declare(strict_types=1);

namespace App\Services;

use App\Events\AchievementUnlocked;
use App\Models\Achievement;
use App\Models\GameSession;
use App\Models\User;
use App\Models\UserAchievement;

class AchievementService
{
    /**
     * Check all unearned achievements against a completed game session.
     *
     * Creates UserAchievement records for newly unlocked achievements
     * and broadcasts AchievementUnlocked events.
     *
     * @return array<int, Achievement>  Newly unlocked achievements.
     */
    public function check(User $user, GameSession $session): array
    {
        $alreadyUnlocked = UserAchievement::where('user_id', $user->id)
            ->pluck('achievement_id')
            ->toArray();

        $candidates = Achievement::whereNotIn('id', $alreadyUnlocked)
            ->get();

        $unlocked = [];

        foreach ($candidates as $achievement) {
            if (! $this->evaluate($achievement, $user, $session)) {
                continue;
            }

            UserAchievement::create([
                'user_id'        => $user->id,
                'achievement_id' => $achievement->id,
                'unlocked_at'    => now(),
            ]);

            $unlocked[] = $achievement;

            broadcast(new AchievementUnlocked(
                $user->id,
                $achievement,
            ))->toOthers();
        }

        return $unlocked;
    }

    /**
     * Evaluate a single achievement condition against the session data.
     */
    private function evaluate(Achievement $achievement, User $user, GameSession $session): bool
    {
        return match ($achievement->condition_type) {
            'games_played'   => $user->games_played >= $achievement->condition_value,
            'score_threshold' => $this->checkScoreThreshold($achievement, $session),
            'distance'       => $this->checkDistance($achievement, $session),
            'wave_reached'   => $this->checkWaveReached($achievement, $session),
            'turns_survived' => $this->checkTurnsSurvived($achievement, $session),
            default          => false,
        };
    }

    /**
     * Check score_threshold — for dojo-3d this maps to max_combo.
     * The combo_king achievement (condition_value=10) checks max_combo >= 10.
     */
    private function checkScoreThreshold(Achievement $achievement, GameSession $session): bool
    {
        if ($achievement->game_id === 'dojo-3d' && $session->dojoSession) {
            return $session->dojoSession->max_combo >= $achievement->condition_value;
        }

        return $session->score >= $achievement->condition_value;
    }

    private function checkDistance(Achievement $achievement, GameSession $session): bool
    {
        if (! $session->runnerSession) {
            return false;
        }

        return $session->runnerSession->distance_meters >= $achievement->condition_value;
    }

    private function checkWaveReached(Achievement $achievement, GameSession $session): bool
    {
        if (! $session->dojoSession) {
            return false;
        }

        return $session->dojoSession->waves_survived >= $achievement->condition_value;
    }

    private function checkTurnsSurvived(Achievement $achievement, GameSession $session): bool
    {
        if (! $session->cardSession) {
            return false;
        }

        return $session->cardSession->turns_survived <= $achievement->condition_value
            || $session->cardSession->cards_drawn >= $achievement->condition_value;
    }
}
