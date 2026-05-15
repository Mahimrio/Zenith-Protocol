<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforms a User model into a consistent API response shape.
 *
 * Fields: id, name, email, avatar_url, total_score, games_played, created_at
 */
class UserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'email'        => $this->email,
            'avatar_url'   => $this->avatar_url,
            'total_score'  => (int) $this->total_score,
            'games_played' => (int) $this->games_played,
            'created_at'   => $this->created_at?->format('d M Y'),
        ];
    }
}
