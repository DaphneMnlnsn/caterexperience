<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AuditLogger
{
    public static function log($action, $details = null, $actor = null)
    {
        $actor = $actor ?? Auth::user();
        if (!$actor) {
            return;
        }

        if ($actor instanceof \Laravel\Sanctum\PersonalAccessToken && method_exists($actor, 'tokenable')) {
            $actor = $actor->tokenable;
        }

        $recentExists = $actor->auditLogs()
            ->where('action', $action)
            ->where('details', $details)
            ->where('timestamp', '>=', Carbon::now()->subSeconds(10))
            ->exists();

        if (strtolower($action) === 'Viewed' && $recentExists) {
            return;
        }

        $actor->auditLogs()->create([
            'action'    => $action,
            'timestamp' => Carbon::now(),
            'details'   => $details,
        ]);
    }
}