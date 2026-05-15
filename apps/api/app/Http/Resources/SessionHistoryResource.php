<?php
declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'game_id'      => $this->game_id,
            'score'        => $this->score,
            'completed_at' => $this->completed_at->format('M d, Y'),
            'detail'       => match($this->game_id) {
                'dojo-3d'      => $this->dojoSession
                                    ? "Wave {$this->dojoSession->waves_survived} · "
                                      . "{$this->dojoSession->enemies_killed} enemies"
                                    : null,
                'cyber-runner' => $this->runnerSession
                                    ? "{$this->runnerSession->distance_meters}m · "
                                      . "{$this->runnerSession->peak_speed} spd"
                                    : null,
                'card-battler' => $this->cardSession
                                    ? "{$this->cardSession->turns_survived} turns · "
                                      . "{$this->cardSession->cards_played} cards"
                                    : null,
                default        => null,
            }
        ];
    }
}
