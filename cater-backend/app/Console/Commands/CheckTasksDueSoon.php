<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Notifications\TaskDueSoonNotification;
use App\Notifications\TaskOverdueNotification;
use Carbon\Carbon;

class CheckTasksDueSoon extends Command
{
    protected $signature = 'notifications:check-tasks';
    protected $description = 'Send notifications to staff when tasks are nearly due or overdue';

    public function handle()
    {
        $tomorrowStart = now()->addDay()->startOfDay();
        $tomorrowEnd   = now()->addDay()->endOfDay();

        $tasksDueSoon = Task::whereBetween('due_date', [$tomorrowStart, $tomorrowEnd])
            ->whereNotIn('status', ['Completed', 'Done'])
            ->with('assignee')
            ->get();

        foreach ($tasksDueSoon as $task) {
            $user = $task->assignee;
            if (! $user) continue;

            $exists = $user->notifications()
                ->where('type', TaskDueSoonNotification::class)
                ->where('data->task_id', $task->task_id)
                ->exists();

            if (! $exists) {
                $user->notify(new TaskDueSoonNotification($task));
            }
        }

        $tasksOverdue = Task::where('due_date', '<', now()->startOfDay())
        ->whereNotIn('status', ['Completed', 'Done'])
        ->with('assignee')
        ->get();

        foreach ($tasksOverdue as $task) {
            $user = $task->assignee;
            if (! $user) continue;

            $exists = $user->notifications()
                ->where('type', TaskOverdueNotification::class)
                ->where('data->task_id', $task->task_id)
                ->exists();

            if (! $exists) {
                $user->notify(new TaskOverdueNotification($task));
            }
        }

        $this->info('Task due soon & overdue notifications sent.');
        return 0;
    }
}
