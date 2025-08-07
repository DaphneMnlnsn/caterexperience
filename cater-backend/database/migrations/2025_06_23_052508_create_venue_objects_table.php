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
        Schema::create('venue_objects', function (Blueprint $table) {
            $table->id('object_id');
            $table->string('object_name');
            $table->string('object_type');
            $table->json('object_props');
            $table->float('default_x')->nullable();
            $table->float('default_y')->nullable();
            $table->float('default_rotation')->default(0);
            $table->float('default_scale')->default(1);
            $table->integer('z_index')->default(0);
            $table->boolean('archived')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venue_objects');
    }
};
