<?php

use App\Http\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::prefix('audit')->group(function () {
    Route::get('/', [AuditLogController::class, 'index']);
});