<?php

use App\Http\Controllers\ExtraChargeController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin')->group(function () {
    Route::prefix('payments')->group(function() {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'indexSelected']);
        Route::post('/', [PaymentController::class, 'store']);
        Route::put('/{id}', [PaymentController::class, 'update']);
        Route::delete('/{id}', [PaymentController::class, 'destroy']);
    });
    
    Route::get('/bookings/{bookingId}/extra-charges', [ExtraChargeController::class, 'index']);
    Route::post('/extra-charges', [ExtraChargeController::class, 'store']);
    Route::put('/extra-charges/{id}', [ExtraChargeController::class, 'update']);
    Route::delete('/extra-charges/{id}', [ExtraChargeController::class, 'destroy']);
});