<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TaskStatusUpdatedNotification extends Notification
{
    use Queueable;

    protected $task;

    public function __construct($task)
    {
        $this->task = $task;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'action'     => 'task_status_updated',
            'task_id'  => $this->task->task_id,
            'booking_id' => $this->task->booking_id,
            'status'   => $this->task->status,
            'message'  => "Task #{$this->task->task_id} status updated to '{$this->task->status}'.",
            'url' => "/bookings/{$this->task->booking_id}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}