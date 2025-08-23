<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin')->group(function () {
    Route::prefix('users')->group(function () {
        Route::post('/', [UserController::class, 'store']);
        Route::get('/', [UserController::class, 'index']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::put('/{id}/archive', [UserController::class, 'archive']);
        Route::put('/{id}/restore', [UserController::class, 'restore']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });
});