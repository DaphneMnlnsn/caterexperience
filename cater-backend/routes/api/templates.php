<?php

use App\Http\Controllers\TemplateSetupController;
use Illuminate\Support\Facades\Route;

Route::prefix('templates')->group(function() {
    Route::get('/', [TemplateSetupController::class, 'index']);
    Route::post('/', [TemplateSetupController::class, 'store']);
    Route::get('/{id}', [TemplateSetupController::class, 'show']);
    Route::put('/{id}', [TemplateSetupController::class, 'update']);
    Route::delete('/{id}', [TemplateSetupController::class, 'destroy']);
});