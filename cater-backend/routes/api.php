<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EventBookingController;
use App\Http\Controllers\UserController;

Route::get('/test', function () {
    return ['message' => 'API route works!'];
});
Route::post('/login', [AuthController::class, 'login']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users', [UserController::class, 'index']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
Route::post('/customers', [CustomerController::class, 'register']);
Route::get('/customers', action: [CustomerController::class, 'index']);
Route::get('/customers/{id}', [CustomerController::class, 'indexSelected']);
Route::put('/customers/{id}', [CustomerController::class, 'update']);
Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);
Route::get('/bookings', action: [EventBookingController::class, 'index']);