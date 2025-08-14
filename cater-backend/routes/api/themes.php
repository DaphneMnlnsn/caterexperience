<?php

use App\Http\Controllers\ThemeController;
use Illuminate\Support\Facades\Route;

Route::prefix('themes')->group(function() {
    Route::post('/', [ThemeController::class, 'store']);
    Route::put('/{id}', [ThemeController::class, 'update']);
    Route::delete('/{id}', [ThemeController::class, 'destroy']);
});