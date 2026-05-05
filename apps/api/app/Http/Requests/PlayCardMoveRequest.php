<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlayCardMoveRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'session_id' => ['required', 'uuid', 'exists:game_sessions,id'],
            'move_type' => ['required', 'in:play_card,end_turn'],
            'card_id' => ['required_if:move_type,play_card', 'string']
        ];
    }
}
