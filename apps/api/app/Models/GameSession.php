<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class GameSession extends Model {
    use HasUuids, HasFactory;

    protected $fillable = [
        'user_id', 'game_id', 'score', 'metadata', 'server_validated_at', 'started_at', 'completed_at'
    ];

    protected function casts(): array {
        return [
            'metadata' => 'array',
            'server_validated_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function dojoSession(): HasOne {
        return $this->hasOne(DojoSession::class, 'session_id');
    }

    public function cardSession(): HasOne {
        return $this->hasOne(CardSession::class, 'session_id');
    }

    public function runnerSession(): HasOne {
        return $this->hasOne(RunnerSession::class, 'session_id');
    }
}
