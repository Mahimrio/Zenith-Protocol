<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Achievement extends Model
{
    protected $fillable = [
        'slug', 'name', 'description', 'icon', 'game_id',
        'condition_type', 'condition_value',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'condition_value' => 'integer',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }
}
