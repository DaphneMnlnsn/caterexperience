<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/test', function () {
    return ['message' => 'API route works!'];
});
Route::post('/login', [AuthController::class, 'login']);