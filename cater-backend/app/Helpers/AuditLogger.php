<?php

namespace App\Helpers;

use App\Models\AuditLog;
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

        $actor->auditLogs()->create([
            'action'     => $action,
            'timestamp'  => Carbon::now(),
            'details'    => $details,
        ]);
    }
}