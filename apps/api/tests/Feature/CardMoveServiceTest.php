<?php
declare(strict_types=1);

use App\Models\User;
use App\Models\GameSession;
use App\Services\CardMoveService;
use Illuminate\Support\Facades\Cache;

test('rejects play_card when player has insufficient mana', function () {
    $user = User::factory()->create();
    $session = GameSession::factory()->create(['user_id' => $user->id]);
    Cache::put("card_game_{$session->id}", [
        'current_turn' => 'player',
        'player_hand' => ['a1'],
        'player_mana' => 0
    ]);
    
    $service = new CardMoveService();
    $result = $service->validateMove($user, $session, ['type' => 'play_card', 'card_id' => 'a1']);
    
    $this->assertFalse($result);
});

test('rejects play_card when card not in server hand', function () {
    $user = User::factory()->create();
    $session = GameSession::factory()->create(['user_id' => $user->id]);
    Cache::put("card_game_{$session->id}", [
        'current_turn' => 'player',
        'player_hand' => ['a2'],
        'player_mana' => 5
    ]);
    
    $service = new CardMoveService();
    $result = $service->validateMove($user, $session, ['type' => 'play_card', 'card_id' => 'a1']);
    
    $this->assertFalse($result);
});

test('processes valid move and returns updated state', function () {
    $user = User::factory()->create();
    $session = GameSession::factory()->create(['user_id' => $user->id]);
    Cache::put("card_game_{$session->id}", [
        'current_turn' => 'player',
        'player_hand' => ['a1'],
        'player_mana' => 5
    ]);
    
    $service = new CardMoveService();
    $result = $service->validateMove($user, $session, ['type' => 'play_card', 'card_id' => 'a1']);
    
    $this->assertTrue($result);
    $state = Cache::get("card_game_{$session->id}");
    $this->assertEquals(4, $state['player_mana']);
    $this->assertEmpty($state['player_hand']);
});
