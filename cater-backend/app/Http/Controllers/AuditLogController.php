<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditLogController extends Controller
{
    public function index()
    {
        AuditLogger::log('Viewed', 'Module: Audit Log | Viewed audit logs');

        $logs = AuditLog::all();
        return response()->json(['logs' => $logs]);
    }
}
