<?php

namespace App\Providers;

use App\Guards\MultiSanctumGuard;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->registerPolicies();
        
        Auth::extend('multi_sanctum', function ($app, $name, array $config) {
            return new MultiSanctumGuard(
                Auth::createUserProvider($config['provider'])
            );
        });
    }
}
