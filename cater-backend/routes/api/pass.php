<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

Route::post('/password/email', function(Request $request) {
    $request->validate(['email' => 'required|email']);

    $email = $request->email;
    $broker = null;

    if (User::where('email', $email)->exists()) {
        $broker = 'users';
    } elseif (Customer::where('customer_email', $email)->exists()) {
        $broker = 'customers';
    } else {
        return response()->json(['message' => 'Email not found in our records.'], 404);
    }

    $status = Password::broker($broker)->sendResetLink(['email' => $email]);

    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => __($status)])
        : response()->json(['message' => __($status)], 400);
});

Route::post('/password/reset', function(Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $email = $request->email;
    $broker = null;

    if (User::where('email', $email)->exists()) {
        $broker = 'users';
    } elseif (Customer::where('customer_email', $email)->exists()) {
        $broker = 'customers';
    } else {
        return response()->json(['message' => 'Email not found in our records.'], 404);
    }

    if ($broker === 'customers') {
        $status = Password::broker($broker)->reset(
            [
                'customer_email' => $email,
                'password' => $request->password,
                'password_confirmation' => $request->password_confirmation,
                'token' => $request->token,
            ],
            function ($user, $password) {
                $user->forceFill(['customer_password' => Hash::make($password)])->save();
            }
        );
    } else {
        $status = Password::broker($broker)->reset(
            [
                'email' => $email,
                'password' => $request->password,
                'password_confirmation' => $request->password_confirmation,
                'token' => $request->token,
            ],
            function ($user, $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
            }
        );
    }

    return $status === Password::PASSWORD_RESET
        ? response()->json(['message' => __($status)])
        : response()->json(['message' => __($status)], 400);
})->name('password.reset');