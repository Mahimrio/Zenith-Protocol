<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DojoSession extends Model {
    protected $primaryKey = 'session_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'session_id', 'waves_survived', 'enemies_killed', 'max_combo', 'survival_ms'
    ];

    public function gameSession(): BelongsTo {
        return $this->belongsTo(GameSession::class, 'session_id');
    }
}
