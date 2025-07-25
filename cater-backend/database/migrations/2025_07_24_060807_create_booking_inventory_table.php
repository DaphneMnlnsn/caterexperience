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
        Schema::create('booking_inventory', function (Blueprint $table) {
            $table->id('booking_inventory_id');
            
            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger(column: 'item_id');
            
            $table->integer('quantity_assigned');            
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->foreign('booking_id')->references('booking_id')->on('event_booking')->onDelete('cascade');
            $table->foreign('item_id')->references('item_id')->on('inventory')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_inventory');
    }
};
