<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'customer_firstname' => 'required|string|max:255',
            'customer_lastname' => 'required|string|max:255',
            'customer_email' => 'required|email|unique:customers',
            'customer_password' => 'required|string|min:8',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',
        ]);

        Customer::create([
            'customer_firstname' => $validated['customer_firstname'],
            'customer_lastname' => $validated['customer_lastname'],
            'customer_middlename' => $request->customer_middlename,
            'customer_email' => $validated['customer_email'],
            'customer_password' => Hash::make($validated['customer_password']),
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
        ]);

        return response()->json(['message' => 'Customer registered successfully']);
    }
}
