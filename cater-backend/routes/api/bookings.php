<?php

use App\Http\Controllers\BookingInventoryController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/calendar/events', [EventBookingController::class, 'calendarEvents']);

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

Route::put('/assigned-inventory/{id}', [BookingInventoryController::class, 'update']);
Route::delete('/assigned-inventory/{id}', [BookingInventoryController::class, 'destroy']);
Route::put('/inventory-usage/{id}', [BookingInventoryController::class, 'updateUsage']);