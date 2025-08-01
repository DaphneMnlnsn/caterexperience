<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::orderBy('created_at', 'desc')->paginate(10);

        AuditLogger::log('Viewed', 'Module: User | Viewed user list');

        return response()->json([
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|max:15',
            'address' => 'required|string|max:255',
            'gender' => 'required|string',
            'role' => 'required|string',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'user_phone' => $validated['phone'],
            'address' => $validated['address'],
            'gender' => $validated['gender'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['last_name'] . ".123"),
        ]);

        AuditLogger::log('Created', "Module: User | Created user: {$user->first_name} {$user->last_name}, ID: {$user->id}");

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|max:15',
            'address' => 'required|string|max:255',
            'gender' => 'required|string',
            'role' => 'required|string',
        ]);

        $user->update([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'user_phone' => $validated['phone'],
            'address' => $validated['address'],
            'gender' => $validated['gender'],
            'role' => $validated['role'],
        ]);

        AuditLogger::log('Updated', "Module: User | Updated user: {$user->first_name} {$user->last_name}, ID: {$user->id}");

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $userName = $user->first_name . ' ' . $user->last_name;
        $userId = $user->id;
        $user->delete();

        AuditLogger::log('Deleted', "Module: User | Deleted user: {$userName}, ID: {$userId}");

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
