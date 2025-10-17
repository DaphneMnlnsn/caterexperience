<?php

use App\Http\Controllers\FeedbackController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin')->group(function () {
    Route::prefix('feedback')->group(function() {
        Route::post('/', [FeedbackController::class, 'store']);
        Route::get('/booking/{id}', [FeedbackController::class, 'indexSelected']);
        Route::get('/', [FeedbackController::class, 'index']);
    });
});