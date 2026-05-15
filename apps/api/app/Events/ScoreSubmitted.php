<?php
declare(strict_types=1);

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Fired after a game score is server-validated and persisted.
 *
 * Uses ShouldBroadcastNow to bypass the queue — leaderboard
 * updates must be instant for a real-time competitive UX.
 *
 * Channel: leaderboard.{gameId} (public — no auth required).
 */
class ScoreSubmitted implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(
        public readonly string $gameId,
        public readonly int    $rank,
        public readonly User   $user,
        public readonly int    $score,
    ) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return [
            new Channel('leaderboard.' . $this->gameId),
        ];
    }

    /**
     * Custom event name — frontend listens for '.score.submitted'.
     */
    public function broadcastAs(): string
    {
        return 'score.submitted';
    }

    /**
     * Payload sent over the wire.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'rank'         => $this->rank,
            'user'         => [
                'id'         => $this->user->id,
                'name'       => $this->user->name,
                'avatar_url' => $this->user->avatar_url,
            ],
            'score'        => $this->score,
            'game_id'      => $this->gameId,
            'submitted_at' => now()->toISOString(),
        ];
    }
}
