<?php

namespace App\Notifications;

use Illuminate\Broadcasting\Channel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class InventoryUsageUpdatedNotification extends Notification
{
    use Queueable;

    protected $usage, $notifiable;
    protected $type;

    public function __construct($usage, $type)
    {
        $this->usage = $usage;
        $this->type = $type;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {

        return [
            'action' => 'inventory_usage_updated',
            'booking_id' => $this->usage->bookingInventory->booking_id,
            'inventory_item' => $this->usage->bookingInventory->item->item_name,
            'quantity_returned' => $this->usage->quantity_returned,
            'message' => "Inventory item {$this->usage->bookingInventory->item->item_name} had its returned quantity updated.",
            'url' => "/bookings/{$this->usage->bookingInventory->booking_id}",
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