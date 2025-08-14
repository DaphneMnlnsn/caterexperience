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
        Schema::create('venue_setup', function (Blueprint $table) {
            $table->id('setup_id');

            $table->unsignedBigInteger('booking_id');
            $table->string('layout_name');
            $table->string('layout_type')->default('Custom Venue');
            $table->text('notes')->nullable();
            $table->string('status')->default('draft');

            $table->timestamps();

            $table->foreign('booking_id')->references('booking_id')->on('event_booking')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venue_setup');
    }
};
