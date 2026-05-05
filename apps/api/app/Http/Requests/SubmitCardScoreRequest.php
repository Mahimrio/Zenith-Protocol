<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitCardScoreRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'turns_survived' => ['required', 'integer', 'min:1', 'max:500'],
            'cards_played' => ['required', 'integer', 'min:0', 'max:1000'],
            'final_score' => ['required', 'integer', 'min:0']
        ];
    }
}
