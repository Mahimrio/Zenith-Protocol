<?php
declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\DailyChallenge;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class GenerateDailyChallenges extends Command
{
    protected $signature = 'challenges:generate';
    protected $description = 'Generate 3 daily challenges for tomorrow (idempotent)';

    private const GAME_IDS = ['dojo-3d', 'card-battler', 'cyber-runner'];

    private const CHALLENGE_POOLS = [
        'dojo-3d' => [
            ['challenge_type' => 'min_score', 'target_value' => 500, 'title' => 'Score {val}+ Points', 'description' => 'Earn at least {val} points in a single Dojo run.'],
            ['challenge_type' => 'min_score', 'target_value' => 1000, 'title' => 'Score {val}+ Points', 'description' => 'Earn at least {val} points in a single Dojo run.'],
            ['challenge_type' => 'min_wave', 'target_value' => 5, 'title' => 'Reach Wave {val}', 'description' => 'Survive until wave {val} in Dojo.'],
            ['challenge_type' => 'min_wave', 'target_value' => 8, 'title' => 'Reach Wave {val}', 'description' => 'Survive until wave {val} in Dojo.'],
        ],
        'card-battler' => [
            ['challenge_type' => 'min_score', 'target_value' => 300, 'title' => 'Score {val}+ Points', 'description' => 'Earn at least {val} points in Card Battler.'],
            ['challenge_type' => 'min_score', 'target_value' => 600, 'title' => 'Score {val}+ Points', 'description' => 'Earn at least {val} points in Card Battler.'],
            ['challenge_type' => 'win_in_turns', 'target_value' => 10, 'title' => 'Win in {val} Turns', 'description' => 'Complete a Card Battler run in {val} turns or fewer.'],
            ['challenge_type' => 'win_in_turns', 'target_value' => 12, 'title' => 'Win in {val} Turns', 'description' => 'Complete a Card Battler run in {val} turns or fewer.'],
        ],
        'cyber-runner' => [
            ['challenge_type' => 'min_distance', 'target_value' => 1000, 'title' => 'Run {val}m', 'description' => 'Travel {val} meters in a single Cyber Runner run.'],
            ['challenge_type' => 'min_distance', 'target_value' => 2500, 'title' => 'Run {val}m', 'description' => 'Travel {val} meters in a single Cyber Runner run.'],
            ['challenge_type' => 'min_score', 'target_value' => 1500, 'title' => 'Score {val}+ Points', 'description' => 'Earn at least {val} points in Cyber Runner.'],
            ['challenge_type' => 'min_score', 'target_value' => 3000, 'title' => 'Score {val}+ Points', 'description' => 'Earn at least {val} points in Cyber Runner.'],
        ],
    ];

    public function handle(): int
    {
        $tomorrow = Carbon::tomorrow('UTC');
        $dateStr = $tomorrow->toDateString();

        if (DailyChallenge::whereDate('date', $tomorrow)->count() >= 3) {
            $this->info("Challenges already exist for {$dateStr}.");
            return Command::SUCCESS;
        }

        $seed = crc32($dateStr);
        mt_srand($seed);

        $gameIds = self::GAME_IDS;
        shuffle($gameIds);

        $created = 0;
        foreach ($gameIds as $gameId) {
            $pool = self::CHALLENGE_POOLS[$gameId];
            $template = $pool[array_rand($pool)];

            $targetValue = $template['target_value'];
            $title = str_replace('{val}', (string) $targetValue, $template['title']);
            $description = str_replace('{val}', (string) $targetValue, $template['description']);

            DailyChallenge::create([
                'date' => $tomorrow->toDateString(),
                'game_id' => $gameId,
                'challenge_type' => $template['challenge_type'],
                'target_value' => $targetValue,
                'title' => $title,
                'description' => $description,
                'reward_points' => 500,
            ]);

            $created++;
        }

        mt_srand();

        $this->info("Generated {$created} daily challenges for {$tomorrow->toDateString()}.");
        return Command::SUCCESS;
    }
}
