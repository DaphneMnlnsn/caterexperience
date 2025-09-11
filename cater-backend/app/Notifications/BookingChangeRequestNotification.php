<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class BookingChangeRequestNotification extends Notification
{
    use Queueable;

    protected $booking;
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
            'url'        => "/bookings/{$this->booking->booking_id}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}