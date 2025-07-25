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
        Schema::create('event_inventory_usage', function (Blueprint $table) {
            $table->id('usage_id');

            $table->unsignedBigInteger('booking_inventory_id');

            $table->integer('quantity_used');
            $table->integer('quantity_returned')->default(0);

            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->foreign('booking_inventory_id')->references('booking_inventory_id')->on('booking_inventory')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_inventory_usage');
    }
};
