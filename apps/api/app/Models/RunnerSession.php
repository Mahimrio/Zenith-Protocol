<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RunnerSession extends Model {
    protected $primaryKey = 'session_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'session_id', 'distance_meters', 'peak_speed', 'obstacles_avoided'
    ];

    public function gameSession(): BelongsTo {
        return $this->belongsTo(GameSession::class, 'session_id');
    }
}
