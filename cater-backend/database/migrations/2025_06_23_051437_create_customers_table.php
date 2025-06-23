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
        Schema::create('customers', function (Blueprint $table) {
            $table->id('customer_id');
            $table->string('customer_lastname');
            $table->string('customer_firstname');
            $table->string('customer_middlename')->nullable();
            $table->string('customer_email')->unique();
            $table->string('customer_password');
            $table->string('customer_phone');
            $table->string('customer_address');
            $table->boolean('archived')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
