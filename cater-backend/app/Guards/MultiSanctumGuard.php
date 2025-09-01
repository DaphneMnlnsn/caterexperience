<?php

namespace App\Guards;

use Illuminate\Auth\TokenGuard;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Contracts\Auth\UserProvider;
use App\Models\User;
use App\Models\Customer;

class MultiSanctumGuard extends TokenGuard
{
    protected $user;

    public function __construct(UserProvider $provider)
    {
        $this->provider = $provider;
    }

    public function user()
    {
        if ($this->user) {
            return $this->user;
        }

        $request = app('request');
        $token = $request->bearerToken();

        if (!$token) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return null;
        }

        if ($accessToken->tokenable_type === User::class || $accessToken->tokenable_type === Customer::class) {
            $this->user = $accessToken->tokenable;
            return $this->user;
        }

        return null;
    }
}