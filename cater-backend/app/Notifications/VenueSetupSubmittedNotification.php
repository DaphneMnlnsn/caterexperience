<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class VenueSetupSubmittedNotification extends Notification
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
            'action' => 'venue_setup_submitted',
            'booking_id' => $this->bookingId,
            'message' => "A venue setup has been submitted for your booking (Booking ID: {$this->bookingId}). Please review it.",
            'url' => "/bookings/{$this->bookingId}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}