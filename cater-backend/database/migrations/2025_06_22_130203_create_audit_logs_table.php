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
            $table->morphs('auditable');
            $table->string('action');
            $table->timestamp('timestamp');
            $table->string('details')->nullable();
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
