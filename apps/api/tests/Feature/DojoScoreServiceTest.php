<?php
declare(strict_types=1);

use App\Models\User;
use App\Services\DojoScoreService;

test('rejects score that deviates more than 5% from calculation', function () {
    $user = User::factory()->create();
    $service = new DojoScoreService();
    
    $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
    $this->expectExceptionMessage('Score implausible.');
    
    $service->validateAndSave($user, [
        'survival_ms' => 5000,
        'waves_survived' => 5,
        'enemies_killed' => 10,
        'score' => 50000,
        'max_combo' => 2
    ]);
});

test('rejects implausible enemies killed for wave count', function () {
    $user = User::factory()->create();
    $service = new DojoScoreService();
    
    $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
    
    $service->validateAndSave($user, [
        'survival_ms' => 5000,
        'waves_survived' => 1,
        'enemies_killed' => 50,
        'score' => 550,
        'max_combo' => 100
    ]);
});

test('saves valid session and updates user total score', function () {
    $user = User::factory()->create(['total_score' => 0]);
    $service = new DojoScoreService();
    
    $session = $service->validateAndSave($user, [
        'survival_ms' => 5000,
        'waves_survived' => 2,
        'enemies_killed' => 10,
        'score' => 200,
        'max_combo' => 5
    ]);
    
    $this->assertDatabaseHas('game_sessions', ['id' => $session->id, 'score' => 200]);
    $this->assertEquals(200, $user->fresh()->total_score);
});
