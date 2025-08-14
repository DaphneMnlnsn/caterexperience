<?php

use App\Http\Controllers\AddonController;
use Illuminate\Support\Facades\Route;

Route::prefix('addons')->group(function() {
    Route::post('/', [AddonController::class, 'store']);
    Route::put('/{id}', [AddonController::class, 'update']);
    Route::delete('/{id}', [AddonController::class, 'destroy']);
});