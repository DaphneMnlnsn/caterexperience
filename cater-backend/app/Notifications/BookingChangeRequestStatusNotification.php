<?php

namespace App\Notifications;

use Illuminate\Broadcasting\Channel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class BookingChangeRequestStatusNotification extends Notification
{
    use Queueable;
    
    protected $changeRequest, $notifiable;

    public function __construct($changeRequest)
    {
        $this->changeRequest = $changeRequest;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'action'        => 'booking_change_request',
            'change_request_id' => $this->changeRequest->id,
            'booking_id' => $this->changeRequest->booking_id,
            'status' => $this->changeRequest->status,
            'message' => "Your change request for booking #{$this->changeRequest->booking_id} has been {$this->changeRequest->status}.",
            'url' => "/bookings/{$this->changeRequest->booking_id}",
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

        return [$channelName];
    }

    public function broadcastAs()
    {
        return 'NewNotification';
    }
}

