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
        Schema::create('event_booking', function (Blueprint $table) {
            $table->id('booking_id');

            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('package_id');
            $table->unsignedBigInteger('menu_id')->nullable();
            $table->unsignedBigInteger('theme_id')->nullable();

            $table->string('event_name');
            $table->string('event_type');
            $table->date('event_date');
            $table->time('event_start_time');
            $table->time('event_end_time');
            $table->string('event_location');

            $table->string('celebrant_name')->nullable();
            $table->integer('age')->nullable();

            $table->integer('pax');
            $table->decimal('event_total_price', 10, 2);
            $table->json('price_breakdown')->nullable();
            $table->text('special_request')->nullable();
            $table->string('booking_status')->default('pending');
            
            $table->timestamps();

            $table->foreign('customer_id')->references('customer_id')->on('customers')->onDelete('cascade');
            $table->foreign('package_id')->references('package_id')->on('packages')->onDelete('cascade');
            $table->foreign('menu_id')->references('menu_id')->on('menu')->onDelete('set null');
            $table->foreign('theme_id')->references('theme_id')->on('themes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_booking');
    }
};
