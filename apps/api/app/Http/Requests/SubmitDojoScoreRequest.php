<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitDojoScoreRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'survival_ms' => ['required', 'integer', 'min:1000', 'max:7200000'],
            'waves_survived' => ['required', 'integer', 'min:0', 'max:100'],
            'enemies_killed' => ['required', 'integer', 'min:0', 'max:2000'],
            'score' => ['required', 'integer', 'min:0', 'max:10000000'],
            'max_combo' => ['required', 'integer', 'min:0']
        ];
    }
}
