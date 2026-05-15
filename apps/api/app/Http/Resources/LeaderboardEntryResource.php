<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforms a single GameSession into a leaderboard row.
 *
 * Rank is set via `computed_rank` attribute injected by the controller
 * (avoids a static counter that would break under Octane / concurrent requests).
 */
class LeaderboardEntryResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'rank'         => $this->computed_rank ?? null,
            'user'         => [
                'id'         => $this->user->id,
                'name'       => $this->user->name,
                'avatar_url' => $this->user->avatar_url,
            ],
            'score'        => $this->score,
            'completed_at' => $this->completed_at?->toISOString(),
        ];
    }
}
