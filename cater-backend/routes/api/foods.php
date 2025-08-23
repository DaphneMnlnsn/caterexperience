<?php

use App\Http\Controllers\FoodController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin')->group(function () {
    Route::prefix('foods')->group(function() {
        Route::post('/', [FoodController::class, 'store']);
        Route::put('/{id}', [FoodController::class, 'update']);
        Route::delete('/{id}', [FoodController::class, 'destroy']);
    });
});