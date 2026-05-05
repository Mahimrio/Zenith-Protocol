<?php
declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\GameSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // Create Admin
            $admin = User::create([
                'name' => 'Admin',
                'email' => 'admin@gamehub.com',
                'password' => Hash::make('password'),
                'total_score' => 15000,
                'games_played' => 3
            ]);

            // Create 4 standard users
            $users = collect([$admin]);
            for ($i = 1; $i <= 4; $i++) {
                $users->push(User::create([
                    'name' => "Player $i",
                    'email' => "player$i@gamehub.com",
                    'password' => Hash::make('password'),
                    'total_score' => rand(1000, 5000),
                    'games_played' => 3
                ]));
            }

            // Seed sample sessions for each user
            foreach ($users as $user) {
                // 1. Dojo Session
                $dojoSession = GameSession::create([
                    'user_id' => $user->id,
                    'game_id' => 'dojo-3d',
                    'score' => rand(1000, 5000),
                    'server_validated_at' => now(),
                    'started_at' => now()->subMinutes(10),
                    'completed_at' => now()
                ]);
                $dojoSession->dojoSession()->create([
                    'waves_survived' => rand(1, 10),
                    'enemies_killed' => rand(10, 50),
                    'max_combo' => rand(5, 20),
                    'survival_ms' => rand(60000, 300000)
                ]);

                // 2. Card Battler Session
                $cardSession = GameSession::create([
                    'user_id' => $user->id,
                    'game_id' => 'card-battler',
                    'score' => rand(500, 3000),
                    'server_validated_at' => now(),
                    'started_at' => now()->subMinutes(15),
                    'completed_at' => now()
                ]);
                $cardSession->cardSession()->create([
                    'turns_survived' => rand(5, 20),
                    'cards_played' => rand(15, 60),
                    'cards_drawn' => rand(20, 70),
                    'final_enemy_hp' => rand(-5, 0)
                ]);

                // 3. Cyber Runner Session
                $runnerSession = GameSession::create([
                    'user_id' => $user->id,
                    'game_id' => 'cyber-runner',
                    'score' => rand(2000, 10000),
                    'server_validated_at' => now(),
                    'started_at' => now()->subMinutes(5),
                    'completed_at' => now()
                ]);
                $runnerSession->runnerSession()->create([
                    'distance_meters' => rand(2000, 10000),
                    'peak_speed' => rand(300, 500),
                    'obstacles_avoided' => rand(10, 100)
                ]);
            }
        });
    }
}
