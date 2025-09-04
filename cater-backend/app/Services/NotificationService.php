<?php

namespace App\Services;

use App\Events\SystemNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     *
     * @param string $channel
     * @param string $type
     * @param string $message
     * @param int|string $relatedId
     */
    public static function send($channel, $type, $message, $relatedId)
    {
        $exists = DB::table('notifications')
            ->where('type', $type)
            ->where('notifiable_type', 'system')
            ->where('notifiable_id', $relatedId)
            ->whereDate('created_at', now()->toDateString())
            ->exists();

        if (!$exists) {
            DB::table('notifications')->insert([
                'id' => Str::uuid(),
                'type' => $type,
                'notifiable_type' => 'system',
                'notifiable_id' => $relatedId,
                'data' => json_encode([
                    'channel' => $channel,
                    'message' => $message,
                ]),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            broadcast(new SystemNotification($channel, [
                'type' => $type,
                'message' => $message,
                'related_id' => $relatedId,
            ]));
        }
    }
}
