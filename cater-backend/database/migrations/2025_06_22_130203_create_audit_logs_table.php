<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('auditlog', function (Blueprint $table) {
            $table->id('auditlog_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action');
            $table->timestamp('timestamp');
            $table->string('details')->nullable();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditlog');
    }
};
