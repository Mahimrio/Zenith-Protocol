<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_challenges', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('game_id');
            $table->enum('challenge_type', ['min_score', 'min_wave', 'min_distance', 'win_in_turns']);
            $table->unsignedInteger('target_value');
            $table->string('title');
            $table->string('description');
            $table->unsignedInteger('reward_points')->default(500);
            $table->timestamps();

            $table->unique(['date', 'game_id']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_challenges');
    }
};
