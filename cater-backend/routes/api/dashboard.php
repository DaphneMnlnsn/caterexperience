<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin,stylist,head waiter,cook,client')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
});

Route::middleware('role:admin')->group(function () {
    Route::get('/dashboard/audit-log', [DashboardController::class, 'getAuditLog']);
});

Route::middleware('role:stylist')->group(function () {
    Route::get('/dashboard/stylist/stats', [DashboardController::class, 'getStylistStats']);
});