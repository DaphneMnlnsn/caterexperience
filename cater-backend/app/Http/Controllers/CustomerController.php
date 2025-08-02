<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::orderBy('customer_id', 'desc')->paginate(10);

        AuditLogger::log('Viewed', 'Module: Customer | Viewed customer list');

        return response()->json([
            'customers' => $customers->items(),
            'pagination' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }
    public function indexSelected($id)
    {
        $customer = Customer::with('bookings')->find($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        AuditLogger::log('Viewed', 'Module: Customer | Viewed customer ID: ' . $id);

        return response()->json([
            'customer' => $customer
        ]);
    }
    public function register(Request $request)
    {
        $validated = $request->validate([
            'customer_firstname' => 'required|string|max:255',
            'customer_lastname' => 'required|string|max:255',
            'customer_email' => 'required|email|unique:customers',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',
        ]);

        Customer::create([
            'customer_firstname' => $validated['customer_firstname'],
            'customer_lastname' => $validated['customer_lastname'],
            'customer_middlename' => $request->customer_middlename,
            'customer_email' => $validated['customer_email'],
            'customer_password' => Hash::make($validated['customer_lastname'] . ".123"),
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
        ]);

        AuditLogger::log('Created', 'Module: Customer | Registered customer: ' . $validated['customer_firstname'] . ' ' . $validated['customer_lastname']);

        return response()->json(['message' => 'Customer registered successfully']);
    }
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'customer_firstname' => 'required|string|max:255',
            'customer_lastname' => 'required|string|max:255',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',
        ]);

        $customer->update([
            'customer_firstname' => $validated['customer_firstname'],
            'customer_lastname' => $validated['customer_lastname'],
            'customer_middlename' => $request->customer_middlename,
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
        ]);

        AuditLogger::log('Updated', 'Module: Customer | Updated customer ID: ' . $customer->customer_id);

        return response()->json(['message' => 'Customer updated successfully', 'customer' => $customer]);
    }
    public function destroy($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        AuditLogger::log('Deleted', 'Module: Customer | Deleted customer ID: ' . $id);

        $customer->delete();

        return response()->json(['message' => 'Customer deleted successfully'], 200);
    }
}
