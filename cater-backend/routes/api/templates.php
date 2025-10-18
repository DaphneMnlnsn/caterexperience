<?php

use App\Http\Controllers\TemplateSetupController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin,stylist')->group(function () {
    Route::prefix('templates')->group(function() {
        Route::get('/', [TemplateSetupController::class, 'index']);
        Route::put('/{id}', [TemplateSetupController::class, 'update']);
        Route::post('/', [TemplateSetupController::class, 'store']);
    });
});

Route::middleware('role:admin')->group(function () {
    Route::prefix('templates')->group(function() {
        Route::delete('/{id}', [TemplateSetupController::class, 'destroy']);
    });
});

Route::middleware('role:admin,stylist,head waiter')->group(function () {
    Route::prefix('templates')->group(function() {
        Route::get('/{id}', [TemplateSetupController::class, 'show']);
    });
});