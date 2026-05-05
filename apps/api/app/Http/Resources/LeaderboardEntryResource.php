<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaderboardEntryResource extends JsonResource {
    private static int $rankCounter = 1;

    public function toArray(Request $request): array {
        return [
            'rank' => self::$rankCounter++,
            'user' => [
                'name' => $this->user->name,
                'avatar_url' => $this->user->avatar_url
            ],
            'score' => $this->score,
            'completed_at' => $this->completed_at
        ];
    }
}
