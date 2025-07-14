<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index($bookingId)
    {
        $tasks = Task::with([
            'booking',
            'assignee',
            'creator',
        ])->where('booking_id', $bookingId)->get();

        if ($tasks->isEmpty()) {
            return response()->json(['message' => 'No tasks found'], 404);
        }

        return response()->json($tasks);
    }

    public function indexSelected($id)
    {
        //
    }
    public function indexForStaff($id)
    {
        //
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:event_booking,booking_id',
            'assigned_to' => 'required|exists:users,id',
            'created_by' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:Low,Normal,High',
            'due_date' => 'nullable|date',
            'auto_generated' => 'nullable|boolean',
        ]);

        $task = Task::create($validated);

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load(['booking', 'assignee', 'creator']),
        ], 201);
    }
    public function updateStatus(Request $request, $taskId)
    {
        $task = Task::find($taskId);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $task->status = $request->input('status');
        $task->save();

        return response()->json(['message' => 'Task status updated']);
    }
    public function update(Request $request, $taskId)
    {
        $task = Task::find($taskId);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:Low,Normal,High',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'nullable|string',
        ]);

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'priority' => $validated['priority'],
            'due_date' => $validated['due_date'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'status' => $validated['status'] ?? $task->status,
        ]);

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task->load(['booking', 'assignee', 'creator']),
        ]);
    }
    public function destroy($taskId)
    {
        $task = Task::find($taskId);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }
}