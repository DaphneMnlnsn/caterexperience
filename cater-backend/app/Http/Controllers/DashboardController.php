<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EventBooking;
use App\Models\Payment;
use App\Models\Task;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats()
    {
        return response()->json([
            'total_events' => EventBooking::count(),
            'pending_bookings' => EventBooking::where('booking_status', 'Pending')->count(),
            'pending_payments' => Payment::where('payment_status', 'Pending')->count(),
            'staff_tasks' => Task::where('status', 'To-Do')->count()
        ]);
    }

    public function getAuditLog()
    {
        $logs = DB::table('auditlog')
        ->leftJoin('users', 'auditlog.user_id', '=', 'users.id')
        ->select(
            'auditlog.auditlog_id',
            'auditlog.action',
            'auditlog.details',
            'auditlog.timestamp',
            'users.first_name',
            'users.last_name'
        )
        ->orderByDesc('auditlog.timestamp')
        ->take(10)
        ->get();

        $logs->transform(function ($log) {
            $log->user_name = $log->first_name && $log->last_name
                ? "{$log->first_name} {$log->last_name}"
                : 'Unknown User';
            return $log;
        });

        return response()->json($logs);
    }
}
