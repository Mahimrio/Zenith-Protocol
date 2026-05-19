<?php
declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Models\GameSession;
use App\Models\Achievement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // ── Seed 12 Achievements ────────────────────────────────
            $achievements = [
                // Global
                ['slug' => 'first_game',       'name' => 'First Steps',       'description' => 'Play your first game.',                  'icon' => '🎮', 'game_id' => null,        'condition_type' => 'games_played',    'condition_value' => 1],
                ['slug' => 'veteran',          'name' => 'Veteran',           'description' => 'Play 50 games.',                       'icon' => '⭐', 'game_id' => null,        'condition_type' => 'games_played',    'condition_value' => 50],
                ['slug' => 'legend',           'name' => 'Legend',            'description' => 'Play 200 games.',                      'icon' => '👑', 'game_id' => null,        'condition_type' => 'games_played',    'condition_value' => 200],

                // Dojo 3D
                ['slug' => 'first_blood',      'name' => 'First Blood',       'description' => 'Clear wave 1 in Dojo 3D.',             'icon' => '🩸', 'game_id' => 'dojo-3d',   'condition_type' => 'wave_reached',    'condition_value' => 1],
                ['slug' => 'warlord',          'name' => 'Warlord',           'description' => 'Reach wave 10 in Dojo 3D.',            'icon' => '⚔️', 'game_id' => 'dojo-3d',   'condition_type' => 'wave_reached',    'condition_value' => 10],
                ['slug' => 'immortal',         'name' => 'Immortal',          'description' => 'Reach wave 20 in Dojo 3D.',            'icon' => '🛡️', 'game_id' => 'dojo-3d',   'condition_type' => 'wave_reached',    'condition_value' => 20],
                ['slug' => 'combo_king',       'name' => 'Combo King',        'description' => 'Achieve a 10-kill combo in Dojo 3D.',  'icon' => '🔥', 'game_id' => 'dojo-3d',   'condition_type' => 'score_threshold', 'condition_value' => 10],

                // Card Battler
                ['slug' => 'tactician',        'name' => 'Tactician',         'description' => 'Win a game in under 15 turns.',        'icon' => '🧠', 'game_id' => 'card-battler', 'condition_type' => 'turns_survived',  'condition_value' => 15],
                ['slug' => 'grandmaster',      'name' => 'Grandmaster',       'description' => 'Win 10 Card Battler games.',           'icon' => '🃏', 'game_id' => 'card-battler', 'condition_type' => 'games_played',    'condition_value' => 10],
                ['slug' => 'big_hand',         'name' => 'Big Hand',          'description' => 'Hold 7 cards at once.',                'icon' => '🖐️', 'game_id' => 'card-battler', 'condition_type' => 'turns_survived',  'condition_value' => 7],

                // Cyber Runner
                ['slug' => 'speed_demon',      'name' => 'Speed Demon',       'description' => 'Run 5,000 meters in a single run.',    'icon' => '💨', 'game_id' => 'cyber-runner', 'condition_type' => 'distance',        'condition_value' => 5000],
                ['slug' => 'untouchable',      'name' => 'Untouchable',       'description' => 'Run 10,000 meters in a single run.',   'icon' => '🏃', 'game_id' => 'cyber-runner', 'condition_type' => 'distance',        'condition_value' => 10000],
            ];

            foreach ($achievements as $a) {
                Achievement::create($a);
            }

            // ── Create Users ────────────────────────────────────────
            $admin = User::create([
                'name'         => 'Admin',
                'email'        => 'admin@gamehub.com',
                'password'     => Hash::make('password'),
                'total_score'  => 15000,
                'games_played' => 3,
            ]);

            $users = collect([$admin]);
            for ($i = 1; $i <= 4; $i++) {
                $users->push(User::create([
                    'name'         => "Player $i",
                    'email'        => "player$i@gamehub.com",
                    'password'     => Hash::make('password'),
                    'total_score'  => rand(1000, 5000),
                    'games_played' => 3,
                ]));
            }

            // ── Seed sample sessions ────────────────────────────────
            foreach ($users as $user) {
                $dojoSession = GameSession::create([
                    'user_id'             => $user->id,
                    'game_id'             => 'dojo-3d',
                    'score'               => rand(1000, 5000),
                    'server_validated_at' => now(),
                    'started_at'          => now()->subMinutes(10),
                    'completed_at'        => now(),
                ]);
                $dojoSession->dojoSession()->create([
                    'waves_survived' => rand(1, 10),
                    'enemies_killed' => rand(10, 50),
                    'max_combo'      => rand(5, 20),
                    'survival_ms'    => rand(60000, 300000),
                ]);

                $cardSession = GameSession::create([
                    'user_id'             => $user->id,
                    'game_id'             => 'card-battler',
                    'score'               => rand(500, 3000),
                    'server_validated_at' => now(),
                    'started_at'          => now()->subMinutes(15),
                    'completed_at'        => now(),
                ]);
                $cardSession->cardSession()->create([
                    'turns_survived' => rand(5, 20),
                    'cards_played'   => rand(15, 60),
                    'cards_drawn'    => rand(20, 70),
                    'final_enemy_hp' => rand(-5, 0),
                ]);

                $runnerSession = GameSession::create([
                    'user_id'             => $user->id,
                    'game_id'             => 'cyber-runner',
                    'score'               => rand(2000, 10000),
                    'server_validated_at' => now(),
                    'started_at'          => now()->subMinutes(5),
                    'completed_at'        => now(),
                ]);
                $runnerSession->runnerSession()->create([
                    'distance_meters'   => rand(2000, 10000),
                    'peak_speed'        => rand(300, 500),
                    'obstacles_avoided' => rand(10, 100),
                ]);
            }
        });
    }
}
