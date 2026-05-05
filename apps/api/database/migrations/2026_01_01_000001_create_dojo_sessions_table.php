<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('dojo_sessions', function (Blueprint $table) {
            $table->uuid('session_id')->primary();
            $table->foreign('session_id')->references('id')->on('game_sessions')->cascadeOnDelete();
            $table->unsignedSmallInteger('waves_survived');
            $table->unsignedInteger('enemies_killed');
            $table->unsignedSmallInteger('max_combo');
            $table->unsignedInteger('survival_ms');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('dojo_sessions');
    }
};
