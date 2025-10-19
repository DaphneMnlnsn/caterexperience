<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('notifications:check-bookings')->everyMinute();
Schedule::command('notifications:check-tasks')->everyMinute();
Schedule::command('backup:run')->dailyAt('00:00');
Schedule::command('backup:clean')->weekly();
Schedule::command('inventory:deduct-on-event')->dailyAt('00:00');