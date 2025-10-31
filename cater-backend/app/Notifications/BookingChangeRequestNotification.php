<?php

namespace App\Notifications;

use Illuminate\Broadcasting\Channel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class BookingChangeRequestNotification extends Notification
{
    use Queueable;

    protected $booking, $notifiable;
    protected $requestText;

    public function __construct($booking, $requestText)
    {
        $this->booking = $booking;
        $this->requestText = $requestText;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'action'        => 'booking_change_request',
            'message'     => 'A customer has requested changes to a booking.',
            'booking_id'  => $this->booking->booking_id,
            'request'     => $this->requestText,
            'customer_id' => $this->booking->customer_id,
            'url'        => "/bookings/{$this->booking->event_code}",
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