<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyChallenge extends Model
{
    protected $fillable = [
        'date', 'game_id', 'challenge_type', 'target_value',
        'title', 'description', 'reward_points',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'target_value' => 'integer',
            'reward_points' => 'integer',
        ];
    }

    public function userChallenges(): HasMany
    {
        return $this->hasMany(UserChallenge::class);
    }
}
