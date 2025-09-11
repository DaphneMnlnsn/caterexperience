<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class VenueSetupApprovedNotification extends Notification
{
    use Queueable;

    protected $bookingId;

    public function __construct($bookingId)
    {
        $this->bookingId = $bookingId;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'action' => 'venue_setup_approved',
            'booking_id' => $this->bookingId,
            'message' => "The client has approved the venue setup for Booking ID: {$this->bookingId}.",
            'url' => "/bookings/{$this->bookingId}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}