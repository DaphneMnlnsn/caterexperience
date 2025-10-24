<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\Customer;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::orderBy('customer_id', 'desc')->get();

        AuditLogger::log('Viewed', 'Module: Customer | Viewed full customer list');

        return response()->json([
            'customers' => $customers,
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
            'require_pass_change' => true,
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
            'customer_email' => 'required|email|unique:customers',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',
        ]);

        $customer->update([
            'customer_firstname' => $validated['customer_firstname'],
            'customer_lastname' => $validated['customer_lastname'],
            'customer_email' => $validated['customer_email'],
            'customer_middlename' => $request->customer_middlename,
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
        ]);

        AuditLogger::log('Updated', 'Module: Customer | Updated customer ID: ' . $customer->customer_id);

        NotificationService::sendInformationUpdated($customer->customer_id, true);

        return response()->json(['message' => 'Customer updated successfully', 'customer' => $customer]);
    }

    public function archive($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->archived = 1;
        $customer->save();

        AuditLogger::log('Archived', 'Module: Customer | Archived customer ID: ' . $customer->customer_id);

        return response()->json(['message' => 'Client archived successfully.']);
    }
    public function restore($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->archived = 0;
        $customer->save();

        AuditLogger::log('Restored', 'Module: Customer | Restored customer ID: ' . $customer->customer_id);

        return response()->json(['message' => 'Client restored successfully.']);
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
    public function resetPass(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $defaultPassword = $customer->customer_lastname . ".123";

        $customer->update([
            'customer_password' => Hash::make($defaultPassword),
            'require_pass_change' => true,
        ]);

        AuditLogger::log('Updated', "Module: Customer | Updated customer: {$customer->customer_firstname} {$customer->customer_lastname}, ID: {$customer->customer_id}");

        NotificationService::sendPasswordResetted($customer->customer_id, true);

        return response()->json(['message' => 'Customer updated successfully', 'customer' => $customer]);
    }
    public function profile()
    {
        /** @var \App\Models\Customer $customer */
        $customer = Auth::user();

        if (!$customer) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json($customer);
    }

    public function updateProfile(Request $request)
    {
        /** @var \App\Models\Customer $customer */
        $customer = Auth::user();

        if (!$customer) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'customer_firstname' => 'required|string|max:255',
            'customer_lastname' => 'required|string|max:255',
            'customer_middlename' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_address' => 'nullable|string|max:255',
            'customer_password' => 'nullable|string|min:8|confirmed',
        ]);

        $customer->customer_firstname = $validated['customer_firstname'];
        $customer->customer_lastname = $validated['customer_lastname'];
        $customer->customer_middlename = $validated['customer_middlename'] ?? $customer->customer_middlename;
        $customer->customer_phone = $validated['customer_phone'] ?? $customer->customer_phone;
        $customer->customer_address = $validated['customer_address'] ?? $customer->customer_address;

        if (!empty($validated['customer_password'])) {
            $customer->customer_password = Hash::make($validated['customer_password']);
            $customer->require_pass_change = false;
        }

        $customer->save();

        AuditLogger::log('Updated', "Module: Customer | Updated own profile, ID: {$customer->customer_id}");

        return response()->json(['message' => 'Profile updated successfully', 'customer' => $customer]);
    }
}
