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
        Schema::create('payment', function (Blueprint $table) {
            $table->id('payment_id');

            $table->unsignedBigInteger('booking_id');

            $table->decimal('amount_paid', 10, 2);
            $table->string('payment_method');
            $table->date('payment_date');
            $table->string('payment_status')->default('pending');
            $table->string('proof_image')->nullable();
            $table->text('remarks')->nullable();

            $table->decimal('cash_given', 10, 2)->nullable();
            $table->decimal('change_given', 10, 2)->nullable();

            $table->timestamps();

            $table->foreign('booking_id')->references('booking_id')->on('event_booking')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment');
    }
};
