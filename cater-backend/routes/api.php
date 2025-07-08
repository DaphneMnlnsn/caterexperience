<?php

use App\Http\Controllers\AddonController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\ThemeController;

Route::get('/test', function () {
    return ['message' => 'API route works!'];
});

Route::post('/login', [AuthController::class, 'login']);
Route::get('/bookings/check-availability', [EventBookingController::class, 'checkAvailability']);
Route::get('/packages', [PackageController::class, 'index']);
Route::get('/themes', [ThemeController::class, 'index']);
Route::get('/addons', [AddonController::class, 'index']);
Route::get('/foods', [FoodController::class, 'index']);
Route::post('/customers', [CustomerController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/audit-log', [DashboardController::class, 'getAuditLog']);

    Route::get('/calendar/events', [EventBookingController::class, 'calendarEvents']);

    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{id}', [CustomerController::class, 'indexSelected']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

    Route::get('/bookings', [EventBookingController::class, 'index']);
    Route::get('/bookings/{id}', [EventBookingController::class, 'indexSelected']);
    Route::post('/bookings', [EventBookingController::class, 'store']);
    Route::put('/bookings/{id}', [EventBookingController::class, 'updateBooking']);
    Route::post('/bookings/{id}/finish', [EventBookingController::class, 'finishEvent']);
});