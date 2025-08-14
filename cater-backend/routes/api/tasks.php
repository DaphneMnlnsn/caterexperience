<?php

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::prefix('tasks')->group(function() {
    Route::put('/{taskId}/status', [TaskController::class, 'updateStatus']);
    Route::post('/', [TaskController::class, 'store']);
    Route::put('/{taskId}', [TaskController::class, 'update']);
    Route::delete('/{taskId}', [TaskController::class, 'destroy']);
});