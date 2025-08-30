<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        // First try users table
        if (Auth::attempt($credentials)) {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            AuditLogger::log('Login', "Module: Authentication | Role: {$user->role}");

            return response()->json([
                'status' => 'success',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]);
        }

        $customer = \App\Models\Customer::where('customer_email', $credentials['email'])->first();
        if ($customer && Hash::check($credentials['password'], $customer->customer_password)) {
            $customer->tokens()->delete();
            $token = $customer->createToken('auth_token')->plainTextToken;

            AuditLogger::log('Login', "Module: Authentication | Role: client");

            return response()->json([
                'status' => 'success',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $customer->customer_id,
                    'first_name' => $customer->customer_firstname,
                    'last_name' => $customer->customer_lastname,
                    'email' => $customer->customer_email,
                    'role' => 'client',
                ]
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid credentials'], 401);
    }


    public function logout(Request $request)
    {
        $user = $request->user();
        $request->user()->tokens()->delete();

        AuditLogger::log('Logout', "Module: Authentication | Role: {$user->role}");

        return response()->json(['status' => 'success', 'message' => 'Logged out']);
    }
}
