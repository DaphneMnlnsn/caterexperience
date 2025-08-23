<?php

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
});