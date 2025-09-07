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
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');

            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');

            $table->string('user_phone')->nullable()->after('password');
            $table->boolean('archived')->default(false)->after('role');

            $table->string('address')->nullable()->after('archived');
            $table->string('gender')->nullable()->after('address');
            $table->boolean('require_pass_change')->default(false)->after('gender');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'user_phone',
                'role',
                'archived',
                'address',
                'gender',
            ]);

            $table->string('name')->after('id');
        });
    }
};
