<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
});

Route::middleware('role:admin')->group(function () {
    Route::get('/dashboard/today-events', [DashboardController::class, 'getTodayEvents']);
});

Route::middleware('role:stylist')->group(function () {
    Route::get('/dashboard/stylist/stats', [DashboardController::class, 'getStylistStats']);
});

Route::middleware('role:cook')->group(function () {
    Route::get('/dashboard/cook/stats', [DashboardController::class, 'getCookStats']);
});

Route::middleware('role:head waiter')->group(function () {
    Route::get('/dashboard/waiter/stats', [DashboardController::class, 'getWaiterStats']);
});

Route::middleware('role:client')->group(function () {
    Route::get('/dashboard/client/stats', [DashboardController::class, 'getClientStats']);
});

Route::middleware('role:stylist,cook,head waiter')->group(function () {
    Route::get('/dashboard/staff/today-events', [DashboardController::class, 'getStaffTodayEvents']);
});