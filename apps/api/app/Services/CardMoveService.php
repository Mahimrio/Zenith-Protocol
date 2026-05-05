<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\GameSession;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class CardMoveService {
    public function validateMove(User $user, GameSession $session, array $move): bool {
        $cacheKey = "card_game_{$session->id}";
        $gameState = Cache::get($cacheKey);

        if (!$gameState) {
            return false;
        }

        if ($gameState['current_turn'] !== 'player') {
            return false;
        }

        if ($move['type'] === 'play_card') {
            if (!isset($move['card_id']) || !in_array($move['card_id'], $gameState['player_hand'])) {
                return false;
            }
            $cardCost = 1;
            if ($gameState['player_mana'] < $cardCost) {
                return false;
            }
            $gameState['player_mana'] -= $cardCost;
            $gameState['player_hand'] = array_diff($gameState['player_hand'], [$move['card_id']]);
        } elseif ($move['type'] === 'end_turn') {
            $gameState['current_turn'] = 'enemy';
        }

        Cache::put($cacheKey, $gameState, now()->addMinutes(30));
        return true;
    }
}
