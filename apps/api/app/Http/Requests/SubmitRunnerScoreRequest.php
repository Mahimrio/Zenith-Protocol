<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitRunnerScoreRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'distance_meters' => ['required', 'integer', 'min:1', 'max:9999999'],
            'peak_speed' => ['required', 'integer', 'min:280', 'max:1000'],
            'obstacles_avoided' => ['required', 'integer', 'min:0']
        ];
    }
}
