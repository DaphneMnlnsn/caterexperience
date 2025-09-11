<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\EventBooking;
use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskStatusUpdatedNotification;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class TaskController extends Controller
{
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

        $userId  = $validated['assigned_to'];
        $booking = EventBooking::find($validated['booking_id']);

        NotificationService::sendTaskAssigned($userId, $booking);
        
        AuditLogger::log('Created', "Module: Booking Details | Created task ID: {$task->task_id} for Booking ID: {$task->booking_id}");

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

        AuditLogger::log('Updated', "Module: Booking Details | Updated status of task ID: {$task->task_id} to '{$task->status}'");

        $admins = User::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $admin->notify(new TaskStatusUpdatedNotification($task));
        }

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

        AuditLogger::log('Updated', "Module: Booking Details | Updated task ID: {$task->task_id}");

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

        $taskTitle = $task->title;
        $taskBookingId = $task->booking_id;
        $taskId = $task->task_id;

        $task->delete();

        AuditLogger::log('Deleted', "Module: Booking Details | Deleted task ID: {$taskId}, Title: {$taskTitle}, Booking ID: {$taskBookingId}");

        return response()->json(['message' => 'Task deleted successfully']);
    }
}