<?php

namespace App\Providers;

use Ably\AblyRest;
use App\Broadcasting\AblyBroadcaster;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Broadcast::extend('ably', function ($app) {
            return new AblyBroadcaster(new AblyRest(env('ABLY_API_KEY')));
        });
    }
}
