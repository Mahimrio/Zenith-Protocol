<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Models\GameSession;
use Illuminate\Support\Collection;

interface GameSessionRepositoryInterface {
    public function create(array $data): GameSession;
    public function findByUser(string $userId): Collection;
    public function findById(string $id): ?GameSession;
}
