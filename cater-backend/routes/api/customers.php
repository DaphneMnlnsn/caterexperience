<?php

use App\Http\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::get('/{id}', [CustomerController::class, 'indexSelected']);
    Route::put('/{id}', [CustomerController::class, 'update']);
    Route::put('/{id}/archive', [CustomerController::class, 'archive']);
    Route::put('/{id}/restore', [CustomerController::class, 'restore']);
    Route::delete('/{id}', [CustomerController::class, 'destroy']);
});