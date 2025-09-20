<?php

namespace App\Broadcasting;

use Ably\AblyRest;
use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Support\Arr;

class AblyBroadcaster extends Broadcaster
{
    protected $ably;

    public function __construct(AblyRest $ably)
    {
        $this->ably = $ably;
    }

    public function auth($request)
    {
        return $this->ably->auth->createTokenRequest();
    }

    public function validAuthenticationResponse($request, $result)
    {
        return $result;
    }

    public function broadcast(array $channels, $event, array $payload = [])
    {
        foreach ($channels as $channel) {
            $this->ably->channels->get($channel)->publish($event, $payload);
        }
    }
}
