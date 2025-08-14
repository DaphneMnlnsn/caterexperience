<?php

use App\Http\Controllers\PackageController;
use Illuminate\Support\Facades\Route;

Route::prefix('packages')->group(callback: function() {
    Route::post('/', [PackageController::class, 'store']);
    Route::put('/{id}', [PackageController::class, 'update']);
    Route::delete('/{id}', [PackageController::class, 'destroy']);
});