<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EventBooking;
use App\Models\Payment;
use App\Models\Task;
use App\Models\AuditLog;
use App\Models\VenueSetup;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats()
    {
        $bookingsWithBalance = DB::table('event_booking')
            ->leftJoin('payment', 'event_booking.booking_id', '=', 'payment.booking_id')
            ->select(
                'event_booking.booking_id',
                'event_booking.event_total_price',
                DB::raw('COALESCE(SUM(payment.amount_paid), 0) as total_paid')
            )
            ->groupBy('event_booking.booking_id', 'event_booking.event_total_price')
            ->get()
            ->filter(function ($booking) {
                return $booking->total_paid < $booking->event_total_price;
            });

        return response()->json([
            'total_events' => EventBooking::count(),
            'pending_bookings' => EventBooking::where('booking_status', 'Pending')->count(),
            'pending_payments' => $bookingsWithBalance->count(),
            'staff_tasks' => Task::where('status', 'To-Do')->count()
        ]);
    }

    public function getStylistStats(Request $request)
    {
        $userId = $request->user()->id;

        $totalEvents = EventBooking::whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->count();

        $setupPlansDue = VenueSetup::where('status', 'pending')
            ->whereHas('booking.tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->count();

        $setupPlansSubmitted = VenueSetup::where('status', 'submitted')
            ->whereHas('booking.tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->count();

        $todoTasks = Task::where('assigned_to', $userId)
            ->where('status', 'To-Do')
            ->count();

        $deadlines = VenueSetup::whereHas('booking.tasks', function ($query) use ($userId) {
            $query->where('assigned_to', $userId);
        })
            ->where('status', 'pending')
            ->join('event_booking', 'venue_setup.booking_id', '=', 'event_booking.booking_id')
            ->select(
                'venue_setup.layout_name',
                'venue_setup.status',
                'event_booking.event_date',
                'event_booking.event_start_time',
                DB::raw("DATE_SUB(CONCAT(event_booking.event_date, ' ', event_booking.event_start_time), INTERVAL 7 DAY) as due_date")
            )
            ->get();

        return response()->json([
            'total_events' => $totalEvents,
            'setup_plans_due' => $setupPlansDue,
            'setup_plans_submitted' => $setupPlansSubmitted,
            'todo_tasks' => $todoTasks,
            'deadlines' => $deadlines,
        ]);
    }

    public function getCookStats(Request $request)
    {
        $userId = $request->user()->id;

        $totalEvents = DB::table('event_booking')
            ->join('staff_assignment', 'event_booking.booking_id', '=', 'staff_assignment.booking_id')
            ->where('staff_assignment.user_id', $userId)
            ->count();

        $menuItemsCompleted = DB::table('menu_food')
            ->join('menu', 'menu_food.menu_id', '=', 'menu.menu_id')
            ->join('event_booking', 'event_booking.menu_id', '=', 'menu_food.menu_id')
            ->join('staff_assignment', 'event_booking.booking_id', '=', 'staff_assignment.booking_id')
            ->where('staff_assignment.user_id', $userId)
            ->where('menu_food.status', 'completed')
            ->count();

        $menuItemsPending = DB::table('menu_food')
            ->join('menu', 'menu_food.menu_id', '=', 'menu.menu_id')
            ->join('event_booking', 'event_booking.menu_id', '=', 'menu_food.menu_id')
            ->join('staff_assignment', 'event_booking.booking_id', '=', 'staff_assignment.booking_id')
            ->where('staff_assignment.user_id', $userId)
            ->where('menu_food.status', 'pending')
            ->count();

        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $foodsToPrepare = DB::table('menu_food')
            ->join('menu', 'menu_food.menu_id', '=', 'menu.menu_id')
            ->join('event_booking', 'event_booking.menu_id', '=', 'menu_food.menu_id')
            ->join('food', 'menu_food.food_id', '=', 'food.food_id')
            ->join('staff_assignment', 'event_booking.booking_id', '=', 'staff_assignment.booking_id')
            ->where('staff_assignment.user_id', $userId)
            ->whereIn('event_booking.event_date', [$today, $tomorrow])
            ->select(
                'event_booking.event_date',
                'food.food_name as food_name',
                'menu_food.status'
            )
            ->orderBy('event_booking.event_date')
            ->get()
            ->groupBy('event_date');

        return response()->json([
            'total_events'         => $totalEvents,
            'menu_items_completed' => $menuItemsCompleted,
            'menu_items_pending'   => $menuItemsPending,
            'foods_to_prepare'     => $foodsToPrepare,
        ]);
    }

    public function getWaiterStats(Request $request)
    {

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
                : 'Guest';
            return $log;
        });

        return response()->json($logs);
    }
}
