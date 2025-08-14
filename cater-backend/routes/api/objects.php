<?php

use App\Http\Controllers\VenueObjectController;
use Illuminate\Support\Facades\Route;

Route::prefix('objects')->group(function() {
    Route::get('/', [VenueObjectController::class, 'index']);
    Route::post('/', [VenueObjectController::class, 'store']);
    Route::put('/{id}', [VenueObjectController::class, 'update']);
    Route::put('/archive', [VenueObjectController::class, 'archive']);
    Route::delete('/{id}', [VenueObjectController::class, 'destroy']);
});