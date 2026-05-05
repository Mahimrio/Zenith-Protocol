<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\GameSessionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSessionController extends Controller {
    public function index(Request $request): JsonResponse {
        return response()->json(
            GameSessionResource::collection($request->user()->gameSessions()->latest()->get())
        );
    }
}
