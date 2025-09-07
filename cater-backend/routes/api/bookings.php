<?php

use App\Http\Controllers\BookingChangeRequestController;
use App\Http\Controllers\BookingInventoryController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\MenuFoodController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::middleware('role:admin')->group(function () {
    Route::prefix('bookings')->group(function () {
        Route::get('/', [EventBookingController::class, 'index']);
        Route::post('/', [EventBookingController::class, 'store']);
        Route::put('/{id}', [EventBookingController::class, 'updateBooking']);
        Route::post('/{id}/finish', [EventBookingController::class, 'finishEvent']);
        Route::post('/{id}/cancel', [EventBookingController::class, 'cancelBooking']);
        Route::post('/{id}/resched', [EventBookingController::class, 'reschedBooking']);
        Route::post('/{bookingId}/inventory', [BookingInventoryController::class, 'store']);
    });
    Route::put('/assigned-inventory/{id}', [BookingInventoryController::class, 'update']);
    Route::delete('/assigned-inventory/{id}', [BookingInventoryController::class, 'destroy']);
    Route::put('/requests/{id}/status', [BookingChangeRequestController::class, 'updateStatus']);
});

Route::middleware('role:admin,stylist,head waiter')->group(function () {
    Route::prefix('bookings')->group(function () {
        Route::get('/{id}/inventory-summary', [BookingInventoryController::class, 'index']);
    });
    Route::put('/inventory-usage/{id}', [BookingInventoryController::class, 'updateUsage']);
});

Route::middleware('role:admin,stylist,head waiter,cook,client')->group(function () {
    Route::get('/calendar/events', [EventBookingController::class, 'calendarEvents']);
    Route::prefix('bookings')->group(function () {
        Route::get('/{id}', [EventBookingController::class, 'indexSelected']);
    });
});

Route::middleware('role:stylist,head waiter,cook,client')->group(function () {
    Route::prefix('events')->group(function () {
        Route::get('/assigned', [EventBookingController::class, 'indexAssigned']);
    });
});

Route::middleware('role:cook,admin,head waiter')->group(function () {
    Route::get('/bookings/{booking}/menu-items', [MenuFoodController::class, 'index']);
});

Route::middleware('role:cook')->group(function () {
    Route::put('/menu-food/batch-update', [MenuFoodController::class, 'batchUpdate']);
});

Route::middleware('role:admin,client')->group(function () {
    Route::prefix('bookings')->group(function () {
        Route::post('/{bookingId}/requests', [BookingChangeRequestController::class, 'store']);
        Route::get('/{bookingId}/requests', [BookingChangeRequestController::class, 'index']);
    });
});