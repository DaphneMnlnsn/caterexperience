<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class BookingChangeRequestStatusNotification extends Notification
{
    use Queueable;
    
    protected $changeRequest;

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
        return new BroadcastMessage($this->toArray($notifiable));
    }
}

