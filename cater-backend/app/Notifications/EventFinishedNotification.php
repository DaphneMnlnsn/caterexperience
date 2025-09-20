<?php

namespace App\Notifications;

use Illuminate\Broadcasting\Channel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class EventFinishedNotification extends Notification
{
    use Queueable;

    public $booking, $notifiable;

    public function __construct($booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'action'     => 'event_finished',
            'message'    => "Booking {$this->booking->event_name} must be marked finished",
            'booking_id' => $this->booking->booking_id,
            'url'        => "/bookings/{$this->booking->booking_id}",
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