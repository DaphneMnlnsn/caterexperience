<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PaymentLoggedNotification extends Notification
{
    use Queueable;

    protected $payment;

    public function __construct($payment)
    {
        $this->payment = $payment;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'action'         => 'payment_logged',
            'booking_id'   => $this->payment->booking_id,
            'payment_id'   => $this->payment->payment_id,
            'amount_paid'  => $this->payment->amount_paid,
            'payment_date' => $this->payment->payment_date,
            'message'      => "Your payment of ₱{$this->payment->amount_paid} has been recorded.",
            'url' => "/bookings/{$this->payment->booking_id}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}