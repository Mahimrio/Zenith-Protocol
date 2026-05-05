<?php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\SubmitRunnerScoreRequest;
use App\Http\Resources\GameSessionResource;
use App\Services\RunnerScoreService;
use Illuminate\Http\JsonResponse;

class RunnerController extends Controller {
    public function store(SubmitRunnerScoreRequest $request, RunnerScoreService $service): JsonResponse {
        $session = $service->validateAndSave($request->user(), $request->validated());
        return response()->json(new GameSessionResource($session));
    }
}
