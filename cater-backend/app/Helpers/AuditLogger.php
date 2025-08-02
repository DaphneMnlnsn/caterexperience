<?php

namespace App\Helpers;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AuditLogger
{
    public static function log($action, $details = null, $user = null)
    {
        $userId = is_object($user) ? $user->id : ($user ?? Auth::id());

        AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'timestamp' => Carbon::now(),
            'details' => $details,
        ]);
    }
}