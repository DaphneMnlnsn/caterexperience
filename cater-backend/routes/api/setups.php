<?php

use App\Http\Controllers\VenueSetupController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin,stylist,head waiter')->group(function () {
    Route::prefix('setups')->group(function() {
        Route::post('/', [VenueSetupController::class, 'store']);
        Route::put('/{id}', [VenueSetupController::class, 'update']);
        Route::put('/submit/{id}', [VenueSetupController::class, 'submit']);
    });
});

Route::middleware('role:admin,stylist,head waiter,client')->group(function () {
    Route::prefix('setups')->group(function() {
        Route::get('/', [VenueSetupController::class, 'index']);
        Route::get('/{id}', [VenueSetupController::class, 'indexSelected']);
        Route::get('/setup/{id}', [VenueSetupController::class, 'indexSetup']);
    });
});