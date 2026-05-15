<?php

namespace Database\Factories;

use App\Models\GameSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GameSession>
 */
class GameSessionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = GameSession::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'game_id' => $this->faker->randomElement(['dojo-3d', 'card-battler', 'cyber-runner']),
            'score' => $this->faker->numberBetween(100, 10000),
            'metadata' => [],
            'server_validated_at' => now(),
            'started_at' => now()->subMinutes(5),
            'completed_at' => now(),
        ];
    }
}
