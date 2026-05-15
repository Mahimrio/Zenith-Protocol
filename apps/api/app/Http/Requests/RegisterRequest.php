<?php
declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates user registration payload.
 *
 * Rules:
 *  - name: required, string, max 30 chars
 *  - email: required, valid email, unique in users table
 *  - password: required, min 8 chars, confirmed
 *  - password_confirmation: required
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public registration endpoint
    }

    /** @return array<string, string> */
    public function rules(): array
    {
        return [
            'name'                  => 'required|string|max:30',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required',
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.max'          => 'Callsign must be 30 characters or fewer.',
            'email.unique'      => 'This identifier is already registered.',
            'password.min'      => 'Encryption key must be at least 8 characters.',
            'password.confirmed' => 'Encryption keys do not match.',
        ];
    }
}
