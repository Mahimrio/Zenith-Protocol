<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\PlayCardMoveRequest;
use App\Http\Requests\SubmitCardScoreRequest;
use App\Http\Resources\GameSessionResource;
use App\Models\GameSession;
use App\Services\CardMoveService;
use App\Services\CardScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CardBattlerController extends Controller {
    public function store(SubmitCardScoreRequest $request, CardScoreService $service): JsonResponse {
        $session = $service->validateAndSave($request->user(), $request->validated());
        return response()->json(new GameSessionResource($session));
    }

    public function initSession(Request $request): JsonResponse {
        $session = GameSession::create([
            'user_id' => $request->user()->id,
            'game_id' => 'card-battler',
            'score' => 0,
            'started_at' => now(),
        ]);
        
        $initialState = [
            'current_turn' => 'player',
            'player_hand' => ['a1', 'a2', 'd1'],
            'player_mana' => 1
        ];
        
        Cache::put("card_game_{$session->id}", $initialState, now()->addMinutes(30));
        
        return response()->json(['session_id' => $session->id, 'initial_game_state' => $initialState]);
    }

    public function playMove(PlayCardMoveRequest $request, CardMoveService $service): JsonResponse {
        $session = GameSession::findOrFail($request->session_id);
        $success = $service->validateMove($request->user(), $session, $request->validated());
        
        if (!$success) {
            return response()->json(['message' => 'Invalid move'], 422);
        }
        
        return response()->json(Cache::get("card_game_{$session->id}"));
    }
}
