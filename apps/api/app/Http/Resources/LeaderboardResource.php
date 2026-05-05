<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class LeaderboardResource extends ResourceCollection {
    public function toArray(Request $request): array {
        return [
            'data' => LeaderboardEntryResource::collection($this->collection),
            'generated_at' => now(),
            'game_id' => $request->query('game', 'dojo-3d')
        ];
    }
}
