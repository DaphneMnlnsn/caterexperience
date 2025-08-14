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
        Schema::create('template_setups', function (Blueprint $table) {
            $table->id('template_id');
            $table->string('template_name');
            $table->string('layout_type')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('Active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_setups');
    }
};
