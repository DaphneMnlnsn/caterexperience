<?php

use Illuminate\Support\Facades\Route;
require __DIR__.'/api/public.php';
require __DIR__.'/api/pass.php';

Route::middleware('auth:sanctum')->group(function () {
    require __DIR__.'/api/audit.php';
    require __DIR__.'/api/auth.php';
    require __DIR__.'/api/backups.php';
    require __DIR__.'/api/dashboard.php';
    require __DIR__.'/api/users.php';
    require __DIR__.'/api/customers.php';
    require __DIR__.'/api/bookings.php';
    require __DIR__.'/api/tasks.php';
    require __DIR__.'/api/foods.php';
    require __DIR__.'/api/feedbacks.php';
    require __DIR__.'/api/packages.php';
    require __DIR__.'/api/themes.php';
    require __DIR__.'/api/addons.php';
    require __DIR__.'/api/inventory.php';
    require __DIR__.'/api/payments.php';
    require __DIR__.'/api/setups.php';
    require __DIR__.'/api/objects.php';
    require __DIR__.'/api/templates.php';
    require __DIR__.'/api/notifications.php';
});