<?php

use App\Http\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin')->group(function () {
    Route::prefix('inventory')->group(function() {
        Route::get('/', [InventoryController::class, 'index']);
        Route::get('/{id}', [InventoryController::class, 'indexSelected']);
        Route::post('/', [InventoryController::class, 'store']);
        Route::put('/{id}', [InventoryController::class, 'update']);
        Route::put('/{id}/archive', [InventoryController::class, 'archive']);
        Route::put('/{id}/restore', [InventoryController::class, 'restore']);
        Route::delete('/{id}', [InventoryController::class, 'destroy']);
    });
});