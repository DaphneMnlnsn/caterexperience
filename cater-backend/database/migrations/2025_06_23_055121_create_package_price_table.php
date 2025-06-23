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
        Schema::create('package_price', function (Blueprint $table) {
            $table->id('package_price_id');
            $table->unsignedBigInteger('package_id');
            $table->string('price_label');
            $table->decimal('price_amount', 10, 2);
            $table->integer('pax');
            $table->string('status')->default('available');

            $table->foreign('package_id')->references('package_id')->on('packages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_price');
    }
};
