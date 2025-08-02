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
        Schema::create('template_object_placements', function (Blueprint $table) {
            $table->id('placement_id');
            $table->unsignedBigInteger('template_id');
            $table->unsignedBigInteger('object_id');
            $table->float('x_position');
            $table->float('y_position');
            $table->float('rotation')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();

            $table->foreign('template_id')->references('template_id')->on('template_setups')->onDelete('cascade');
            $table->foreign('object_id')->references('object_id')->on('venue_objects')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_object_placements');
    }
};
