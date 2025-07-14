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
        Schema::create('inventory', function (Blueprint $table) {
            $table->id('item_id');
            $table->string('item_name');
            $table->integer('item_quantity');
            $table->integer('item_current_quantity');
            $table->string('item_unit');
            $table->text('item_description')->nullable();
            $table->decimal('item_price', 10, 2);
            $table->string('item_type');
            $table->string('item_status')->default('available');

            $table->timestamp('last_updated_on')->nullable();
            $table->unsignedBigInteger('last_updated_by')->nullable();

            $table->foreign('last_updated_by')
                  ->references('id')->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
