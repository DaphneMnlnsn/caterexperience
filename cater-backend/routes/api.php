<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\BookingInventoryController;
use App\Http\Controllers\BookingInventoryUsageController;
use App\Http\Controllers\ThemeController;
use App\Http\Controllers\AddonController;
use App\Http\Controllers\InventoryController;
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
    Route::post('/bookings/{id}/cancel', [EventBookingController::class, 'cancelBooking']);
    Route::post('/bookings/{id}/resched', [EventBookingController::class, 'reschedBooking']);

    Route::get('/bookings/{bookingId}/tasks', [TaskController::class, 'index']);
    Route::put('/tasks/{taskId}/status', [TaskController::class, 'updateStatus']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{taskId}', [TaskController::class, 'update']);
    Route::delete('/tasks/{taskId}', [TaskController::class, 'destroy']);

    Route::get('/bookings/{id}/inventory-summary', [BookingInventoryController::class, 'index']);
    Route::post('/bookings/{bookingId}/inventory', [BookingInventoryController::class, 'store']);
    Route::put('/assigned-inventory/{id}', [BookingInventoryController::class, 'update']);
    Route::delete('/assigned-inventory/{id}', [BookingInventoryController::class, 'destroy']);

    Route::put('/inventory-usage/{id}', [BookingInventoryController::class, 'updateUsage']);

    Route::post('/foods', [FoodController::class, 'store']);
    Route::put('/foods/{id}', [FoodController::class, 'update']);
    Route::delete('/foods/{id}', [FoodController::class, 'destroy']);

    Route::post('/packages', [PackageController::class, 'store']);
    Route::put('/packages/{id}', [PackageController::class, 'update']);
    Route::delete('/packages/{id}', [PackageController::class, 'destroy']);

    Route::post('/themes', [ThemeController::class, 'store']);
    Route::put('/themes/{id}', [ThemeController::class, 'update']);
    Route::delete('/themes/{id}', [ThemeController::class, 'destroy']);

    Route::post('/addons', [AddonController::class, 'store']);
    Route::put('/addons/{id}', [AddonController::class, 'update']);
    Route::delete('/addons/{id}', [AddonController::class, 'destroy']);

    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::get('/inventory/{id}', [InventoryController::class, 'indexSelected']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{id}', [PaymentController::class, 'indexSelected']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::put('/payments/{id}', [PaymentController::class, 'update']);
    Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);

});