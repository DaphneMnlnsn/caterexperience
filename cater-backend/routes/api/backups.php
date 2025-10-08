<?php

use App\Http\Controllers\BackupController;
use Illuminate\Support\Facades\Route;

Route::middleware(['role:admin'])->group(function () {
    Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
    Route::post('/backups/run', [BackupController::class, 'run'])->name('backups.run');
    Route::post('/backups/delete', [BackupController::class, 'delete'])->name('backups.delete');
});