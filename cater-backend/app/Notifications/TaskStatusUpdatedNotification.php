<?php

namespace App\Notifications;

use Illuminate\Broadcasting\Channel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class TaskStatusUpdatedNotification extends Notification
{
    use Queueable;

    protected $task, $notifiable;

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
            'title' => $this->task->title,
            'status'   => $this->task->status,
            'message'  => "Task {$this->task->title} status updated to '{$this->task->status}'.",
            'url' => "/bookings/{$this->task->booking->event_code}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        $this->notifiable = $notifiable;
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function broadcastOn()
    {
        if (!isset($this->notifiable)) {
            Log::error('broadcastOn called but notifiable not set on notification; returning fallback channel.');
            return new Channel('notifications-invalid');
        }

        if ($this->notifiable instanceof \App\Models\Customer) {
            $model = 'Customer';
            $id = $this->notifiable->customer_id;
        } else {
            $model = 'User';
            $id = $this->notifiable->id;
        }

        $channelName = "notifications-App.Models.{$model}.{$id}";

        Log::info('broadcastOn: using channel', ['channel' => $channelName]);

        return [$channelName];
    }

    public function broadcastAs()
    {
        return 'NewNotification';
    }
}