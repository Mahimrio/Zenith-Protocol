<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user and issue a Sanctum token.
     *
     * @param RegisterRequest $request  Validated via RegisterRequest form request.
     * @return JsonResponse  UserResource + token payload.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->validated('name'),
            'email'    => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user'       => new UserResource($user),
            'token'      => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Authenticate an existing user and issue a Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email', 'password' => 'required']);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials']]);
        }

        return response()->json([
            'user'       => new UserResource($user),
            'token'      => $user->createToken('auth-token')->plainTextToken,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Revoke the current user's access token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out'], 200);
    }

    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }
}
