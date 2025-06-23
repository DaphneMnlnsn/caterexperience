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
        Schema::create('staff_assignment', function (Blueprint $table) {
            $table->id('assignment_id');

            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger('user_id');

            $table->timestamps();

            $table->foreign('booking_id')->references('booking_id')->on('event_booking')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_assignment');
    }
};
