<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class SystemNotification implements ShouldBroadcast
{
    use SerializesModels;

    public $data;
    public $channel;

    public function __construct($channel, $data)
    {
        $this->channel = $channel;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return new Channel("notifications.".$this->channel);
    }
}