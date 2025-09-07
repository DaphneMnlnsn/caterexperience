<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Events\BookingDeadlineNear;

class AuthController extends Controller
{
    public function testBroadcast()
    {
        event(new BookingDeadlineNear(10));
        return 'Event fired!';
    }
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            if ($user->archived) {
                Auth::logout();
                return response()->json([
                    'status' => 'error',
                    'message' => 'This account is archived. Please contact the administrator.'
                ], 403);
            }

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
                    'require_pass_change' => (bool) $user->require_pass_change,
                ]
            ]);
        }

        $customer = \App\Models\Customer::where('customer_email', $credentials['email'])->first();
        if ($customer && Hash::check($credentials['password'], $customer->customer_password)) {
            
            if ($customer->archived) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This account is archived. Please contact support.'
                ], 403);
            }

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
                    'require_pass_change' => (bool) $customer->require_pass_change,
                ]
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid credentials'], 401);
    }

    public function change(Request $request)
    {
        $request->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        $authUser = Auth::user();

        if ($authUser instanceof \App\Models\User) {
            $authUser->password = Hash::make($request->password);
            $authUser->require_pass_change = false;
            $authUser->save();
        } elseif ($authUser instanceof \App\Models\Customer) {
            $authUser->customer_password = Hash::make($request->password);
            $authUser->require_pass_change = false;
            $authUser->save();
        } else {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json(['message' => 'Password updated successfully']);
    }


    public function logout(Request $request)
    {
        $user = $request->user();
        $request->user()->tokens()->delete();

        AuditLogger::log('Logout', "Module: Authentication | Role: {$user->role}");

        return response()->json(['status' => 'success', 'message' => 'Logged out']);
    }
}
