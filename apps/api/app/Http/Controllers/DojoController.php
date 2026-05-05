<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\SubmitDojoScoreRequest;
use App\Http\Resources\GameSessionResource;
use App\Services\DojoScoreService;
use Illuminate\Http\JsonResponse;

class DojoController extends Controller {
    public function store(SubmitDojoScoreRequest $request, DojoScoreService $service): JsonResponse {
        $session = $service->validateAndSave($request->user(), $request->validated());
        return response()->json(new GameSessionResource($session));
    }
}
