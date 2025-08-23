<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin,stylist,cook,head waiter,client')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});