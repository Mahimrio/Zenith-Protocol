<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('game_id');
            $table->unsignedBigInteger('score');
            $table->json('metadata')->nullable();
            $table->timestamp('server_validated_at')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('game_id');
            $table->index(['score' => 'desc']);
            $table->index(['game_id', 'score' => 'desc']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('game_sessions');
    }
};
