<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('card_sessions', function (Blueprint $table) {
            $table->uuid('session_id')->primary();
            $table->foreign('session_id')->references('id')->on('game_sessions')->cascadeOnDelete();
            $table->unsignedSmallInteger('turns_survived');
            $table->unsignedSmallInteger('cards_played');
            $table->unsignedSmallInteger('cards_drawn');
            $table->smallInteger('final_enemy_hp');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('card_sessions');
    }
};
