<?php

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin,stylist,head waiter,cook')->group(function () {
    Route::prefix('tasks')->group(function() {
        Route::put('/{taskId}/status', [TaskController::class, 'updateStatus']);
        Route::post('/', [TaskController::class, 'store']);
        Route::put('/{taskId}', [TaskController::class, 'update']);
    });
});

Route::middleware('role:admin')->group(function () {
    Route::prefix('tasks')->group(function() {
        Route::delete('/{taskId}', [TaskController::class, 'destroy']);
    });
});