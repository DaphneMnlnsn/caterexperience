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
        Schema::create('theme_images', function (Blueprint $table) {
            $table->id('image_id');
            $table->unsignedBigInteger('theme_id');
            $table->string('image_url');
            $table->timestamps();

            $table->foreign('theme_id')
                ->references('theme_id')
                ->on('themes')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theme_images');
    }
};
