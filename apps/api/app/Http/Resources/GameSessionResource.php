<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameSessionResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'game_id' => $this->game_id,
            'score' => $this->score,
            'completed_at' => $this->completed_at,
            'metadata' => $this->metadata
        ];
    }
}
