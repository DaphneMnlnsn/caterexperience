<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class BookingDeadlineNear implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $bookingId;

    public function __construct($bookingId)
    {
        $this->bookingId = $bookingId;
    }

    public function broadcastOn()
    {
        return ['bookings'];
    }

    public function broadcastAs()
    {
        return 'deadline.near';
    }
}
