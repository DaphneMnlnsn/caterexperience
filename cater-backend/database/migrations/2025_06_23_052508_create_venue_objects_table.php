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
        Schema::create('venue_objects', function (Blueprint $table) {
            $table->id('object_id');
            $table->string('object_name');
            $table->string('object_category');
            $table->integer('object_width');
            $table->integer('object_height');
            $table->string('image_url');
            $table->boolean('archived')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venue_objects');
    }
};
