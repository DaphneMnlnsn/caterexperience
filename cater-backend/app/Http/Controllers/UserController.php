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
        $query = User::orderBy('created_at', 'desc');

        $query->withCount([
            'tasks as tasks_count' => function ($q) {
                $q->where('status', '!=', 'Done');
            }
        ]);

        $users = $query->paginate(10);

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
            'require_pass_change' => true,
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

    public function resetPass(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $defaultPassword = $user->last_name . ".123";

        $user->update([
            'password' => Hash::make($defaultPassword),
            'require_pass_change' => true,
        ]);

        AuditLogger::log('Updated', "Module: User | Updated user: {$user->first_name} {$user->last_name}, ID: {$user->id}");

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }
    public function archive($id)
    {
        $user = User::findOrFail($id);
        $user->archived = 1;
        $user->save();
        
        AuditLogger::log('Archived', 'Module: User | Archived user ID: ' . $user -> $id);

        return response()->json(['message' => 'User archived successfully.']);
    }
    public function restore($id)
    {
        $user = User::findOrFail($id);
        $user->archived = 0;
        $user->save();

        AuditLogger::log('Restored', 'Module: User | Restored user ID: ' . $user -> $id);

        return response()->json(['message' => 'User restored successfully.']);
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
