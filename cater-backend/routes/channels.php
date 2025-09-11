<?php

use Illuminate\Support\Facades\Broadcast;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Log;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    try {
        if (!$user && request()->bearerToken()) {
            $token = PersonalAccessToken::findToken(request()->bearerToken());
            $user = $token ? $token->tokenable : null;
        }
        return $user && (int) $user->id === (int) $id;
    } catch (\Throwable $e) {
        Log::error('Broadcast channel error (User): ' . $e->getMessage());
        return false;
    }
});

Broadcast::channel('App.Models.Customer.{id}', function ($customer, $id) {
    try {
        if (!$customer && request()->bearerToken()) {
            $token = PersonalAccessToken::findToken(request()->bearerToken());
            $customer = $token ? $token->tokenable : null;
        }
        return $customer && (int) $customer->customer_id === (int) $id;
    } catch (\Throwable $e) {
        Log::error('Broadcast channel error (Customer): ' . $e->getMessage());
        return false;
    }
});