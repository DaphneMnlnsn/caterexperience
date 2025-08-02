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
use App\Http\Controllers\TemplateSetupController;
use App\Http\Controllers\VenueObjectController;
use App\Http\Controllers\VenueSetupController;

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

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/audit-log', [DashboardController::class, 'getAuditLog']);

    Route::get('/calendar/events', [EventBookingController::class, 'calendarEvents']);

    Route::prefix('users')->group(function () {
        Route::post('/', [UserController::class, 'store']);
        Route::get('/', [UserController::class, 'index']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });

    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index']);
        Route::get('/{id}', [CustomerController::class, 'indexSelected']);
        Route::put('/{id}', [CustomerController::class, 'update']);
        Route::delete('/{id}', [CustomerController::class, 'destroy']);
    });

    Route::prefix('bookings')->group(function () {
        Route::get('/', [EventBookingController::class, 'index']);
        Route::get('/{id}', [EventBookingController::class, 'indexSelected']);
        Route::post('/', [EventBookingController::class, 'store']);
        Route::put('/{id}', [EventBookingController::class, 'updateBooking']);
        Route::post('/{id}/finish', [EventBookingController::class, 'finishEvent']);
        Route::post('/{id}/cancel', [EventBookingController::class, 'cancelBooking']);
        Route::post('/{id}/resched', [EventBookingController::class, 'reschedBooking']);
        Route::get('/{bookingId}/tasks', [TaskController::class, 'index']);
        Route::get('/{id}/inventory-summary', [BookingInventoryController::class, 'index']);
        Route::post('/{bookingId}/inventory', [BookingInventoryController::class, 'store']);
    });

    Route::prefix('tasks')->group(function() {
        Route::put('/{taskId}/status', [TaskController::class, 'updateStatus']);
        Route::post('/', [TaskController::class, 'store']);
        Route::put('/{taskId}', [TaskController::class, 'update']);
        Route::delete('/{taskId}', [TaskController::class, 'destroy']);
    });

    Route::put('/assigned-inventory/{id}', [BookingInventoryController::class, 'update']);
    Route::delete('/assigned-inventory/{id}', [BookingInventoryController::class, 'destroy']);

    Route::put('/inventory-usage/{id}', [BookingInventoryController::class, 'updateUsage']);

    Route::prefix('foods')->group(function() {
        Route::post('/', [FoodController::class, 'store']);
        Route::put('/{id}', [FoodController::class, 'update']);
        Route::delete('/{id}', [FoodController::class, 'destroy']);
    });

    Route::prefix('packages')->group(function() {
        Route::post('/', [PackageController::class, 'store']);
        Route::put('/{id}', [PackageController::class, 'update']);
        Route::delete('/{id}', [PackageController::class, 'destroy']);
    });

    Route::prefix('themes')->group(function() {
        Route::post('/', [ThemeController::class, 'store']);
        Route::put('/{id}', [ThemeController::class, 'update']);
        Route::delete('/{id}', [ThemeController::class, 'destroy']);
    });

    Route::prefix('addons')->group(function() {
        Route::post('/', [AddonController::class, 'store']);
        Route::put('/{id}', [AddonController::class, 'update']);
        Route::delete('/{id}', [AddonController::class, 'destroy']);
    });

    Route::prefix('inventory')->group(function() {
        Route::get('/', [InventoryController::class, 'index']);
        Route::get('/{id}', [InventoryController::class, 'indexSelected']);
        Route::post('/', [InventoryController::class, 'store']);
        Route::put('/{id}', [InventoryController::class, 'update']);
        Route::delete('/{id}', [InventoryController::class, 'destroy']);
    });

    Route::prefix('payments')->group(function() {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'indexSelected']);
        Route::post('/', [PaymentController::class, 'store']);
        Route::put('/{id}', [PaymentController::class, 'update']);
        Route::delete('/{id}', [PaymentController::class, 'destroy']);
    });

    Route::prefix('setups')->group(function() {
        Route::get('/', [VenueSetupController::class, 'index']);
        Route::post('/', [VenueSetupController::class, 'store']);
        Route::put('/{id}', [VenueSetupController::class, 'update']);
        Route::post('/apply-template', [VenueSetupController::class, 'applyTemplate']);
    });

    Route::prefix('objects')->group(function() {
        Route::get('/', [VenueObjectController::class, 'index']);
        Route::post('/', [VenueObjectController::class, 'store']);
        Route::put('/{id}', [VenueObjectController::class, 'update']);
        Route::put('/archive', [VenueObjectController::class, 'archive']);
        Route::delete('/{id}', [VenueObjectController::class, 'destroy']);
    });

    Route::prefix('templates')->group(function() {
        Route::get('/', [TemplateSetupController::class, 'index']);
        Route::post('/', [TemplateSetupController::class, 'store']);
        Route::get('/{id}', [TemplateSetupController::class, 'show']);
        Route::delete('/{id}', [TemplateSetupController::class, 'destroy']);
    });

});