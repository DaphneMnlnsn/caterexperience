<?php

return [

    'default' => env('BROADCAST_DRIVER', 'null'),

    'connections' => [

        'ably' => [
            'driver' => 'ably',
            'key' => env('ABLY_API_KEY'),
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],

    ],

];
