<?php

namespace App\Notifications;

use Illuminate\Broadcasting\Channel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PaymentLoggedNotification extends Notification
{
    use Queueable;

    protected $payment, $notifiable;

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
            'url' => "/bookings/{$this->payment->booking->event_code}",
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