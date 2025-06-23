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
        Schema::create('venue_object_placement', function (Blueprint $table) {
            $table->id('placement_id');

            $table->unsignedBigInteger('setup_id');
            $table->unsignedBigInteger('object_id');

            $table->float('x_position');
            $table->float('y_position');
            $table->float('rotation')->default(0);

            $table->string('status')->default('active');

            $table->timestamps();

            $table->foreign('setup_id')->references('setup_id')->on('venue_setup')->onDelete('cascade');
            $table->foreign('object_id')->references('object_id')->on('venue_objects')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venue_object_placement');
    }
};
