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

}
