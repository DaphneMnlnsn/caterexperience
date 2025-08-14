<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('/dashboard/audit-log', [DashboardController::class, 'getAuditLog']);