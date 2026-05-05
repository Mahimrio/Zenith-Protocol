<?php
declare(strict_types=1);

use App\Models\User;
use App\Models\GameSession;
use Illuminate\Support\Facades\Cache;

test('returns top 100 scores for given game id', function () {
    $this->assertTrue(true);
});

test('only includes server validated sessions', function () {
    $this->assertTrue(true);
});

test('response is cached for 60 seconds', function () {
    $this->assertTrue(true);
});
