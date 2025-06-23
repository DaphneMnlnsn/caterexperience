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
        Schema::create('event_addon', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger('addon_id');

            $table->integer('quantity')->default(1);
            $table->decimal('price_each', 10, 2);
            $table->decimal('total_price', 10, 2);

            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->foreign('booking_id')->references('booking_id')->on('event_booking')->onDelete('cascade');
            $table->foreign('addon_id')->references('addon_id')->on('addons')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_addon');
    }
};
