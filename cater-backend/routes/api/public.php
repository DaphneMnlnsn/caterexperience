<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\ThemeController;
use App\Http\Controllers\AddonController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;

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
Route::get('/payments/report', [PaymentController::class, 'generateReport']);
Route::get('/audit/report', [AuditLogController::class, 'generateReport']);
Route::get('/bookings/code/{code}', [EventBookingController::class, 'findByCode']);
Route::get('/bookings/public/{id}', [EventBookingController::class, 'indexSelectedPublic']);
Route::get('/test-broadcast', [AuthController::class, 'testBroadcast']);