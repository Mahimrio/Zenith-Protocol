<?php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('runner_sessions', function (Blueprint $table) {
            $table->uuid('session_id')->primary();
            $table->foreign('session_id')->references('id')->on('game_sessions')->cascadeOnDelete();
            $table->unsignedInteger('distance_meters');
            $table->unsignedSmallInteger('peak_speed');
            $table->unsignedSmallInteger('obstacles_avoided');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('runner_sessions');
    }
};
