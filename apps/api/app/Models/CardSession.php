<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardSession extends Model {
    protected $primaryKey = 'session_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'session_id', 'turns_survived', 'cards_played', 'cards_drawn', 'final_enemy_hp'
    ];

    public function gameSession(): BelongsTo {
        return $this->belongsTo(GameSession::class, 'session_id');
    }
}
