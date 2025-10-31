<?php

namespace App\Notifications;

use Illuminate\Broadcasting\Channel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingUpdatedNotification extends Notification
{
    use Queueable;

    protected $booking, $notifiable;

    public function __construct($booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast', 'mail'];
    }

    public function toArray($notifiable)
    {
        return [
            'action'       => 'booking_updated',
            'message'    => 'Booking details have been updated.',
            'booking_id' => $this->booking->booking_id,
            'url' => "/bookings/{$this->booking->event_code}",
        ];
    }

    public function toBroadcast($notifiable)
    {
        $this->notifiable = $notifiable;
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Booking Updated')
            ->greeting('Hello ' . ($notifiable->first_name ?? 'there') . '!')
            ->line("Your booking '{$this->booking->event_name}' details has been updated.")
            ->action('View Booking', env('FRONTEND_URL') . '/bookings/' . $this->booking->event_code)
            ->line('Thank you for booking with Ollinati Catering!');
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