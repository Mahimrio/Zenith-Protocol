<?php
declare(strict_types=1);

namespace App\Events;

use App\Models\Achievement;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Fired when a user unlocks an achievement.
 *
 * Broadcasts on the private channel 'user.{userId}' so only
 * the owning user receives the notification in real time.
 */
class AchievementUnlocked implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(
        public readonly string      $userId,
        public readonly Achievement $achievement,
    ) {}

    /** @return array<int, PrivateChannel> */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->userId),
        ];
    }

    /**
     * Custom event name — frontend listens for '.achievement.unlocked'.
     */
    public function broadcastAs(): string
    {
        return 'achievement.unlocked';
    }

    /**
     * Payload sent over the wire.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'achievement' => [
                'slug'        => $this->achievement->slug,
                'name'        => $this->achievement->name,
                'description' => $this->achievement->description,
                'icon'        => $this->achievement->icon,
            ],
            'unlocked_at' => now()->toISOString(),
        ];
    }
}
