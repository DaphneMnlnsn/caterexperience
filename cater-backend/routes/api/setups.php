<?php

use App\Http\Controllers\VenueSetupController;
use Illuminate\Support\Facades\Route;

Route::prefix('setups')->group(function() {
    Route::get('/', [VenueSetupController::class, 'index']);
    Route::get('/{id}', [VenueSetupController::class, 'indexSelected']);
    Route::get('/setup/{id}', [VenueSetupController::class, 'indexSetup']);
    Route::post('/', [VenueSetupController::class, 'store']);
    Route::put('/{id}', [VenueSetupController::class, 'update']);
    Route::put('/submit/{id}', [VenueSetupController::class, 'submit']);
});