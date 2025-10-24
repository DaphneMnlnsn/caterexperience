<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EventBooking;
use App\Models\Payment;
use App\Models\Task;
use App\Models\AuditLog;
use App\Models\EventInventoryUsage;
use App\Models\VenueSetup;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
            ->whereNotIn('event_booking.booking_status', ['Finished', 'Cancelled'])
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
            ->whereNotIn('event_booking.booking_status', ['Finished', 'Cancelled'])
            ->get()
            ->groupBy('event_date')
            ->map(function ($foods, $date) {
                return [
                    'date' => $date,
                    'foods' => $foods->values(),
                ];
            })
            ->values();
    
        return response()->json([
            'total_events'         => $totalEvents,
            'menu_items_completed' => $menuItemsCompleted,
            'menu_items_pending'   => $menuItemsPending,
            'foods_to_prepare'     => $foodsToPrepare,
        ]);
    }

    /*public function getWaiterStats(Request $request)
    {
        $userId = $request->user()->id;
        $today = now()->toDateString();

        $totalEvents = EventBooking::whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->count();

        $upcomingEvent = EventBooking::whereDate('event_date', '>=', $today)
            ->whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->with(['bookingInventory.item', 'bookingInventory.usage'])
            ->orderBy('event_date', 'asc')
            ->orderBy('event_start_time', 'asc')
            ->first();

        $setupChecklist = collect();
        $callTime = "N/A";
        $inventoryItems = "N/A";

        if ($upcomingEvent) {
            $startDateTime = \Carbon\Carbon::parse($upcomingEvent->event_date . ' ' . $upcomingEvent->event_start_time);
            $callTime = $startDateTime->copy()->subHours(2)->format('Y-m-d H:i:s');

            $setupChecklist->push([
                'event_name'      => $upcomingEvent->event_name ?? 'N/A',
                'event_date'    => $upcomingEvent->event_date,
                'event_start'   => $upcomingEvent->event_start_time,
                'call_time'     => $callTime,
                'inventory'     => $upcomingEvent->bookingInventory->map(function ($inv) {
                    return [
                        'item_name'        => $inv->item->item_name ?? null,
                        'quantity_assigned'=> $inv->quantity_assigned,
                        'quantity_returned'=> optional($inv->usage)->quantity_returned ?? 0,
                    ];
                }),
            ]);

            $inventoryItems = $upcomingEvent->bookingInventory
                ->filter(function ($inv) {
                    return optional($inv->usage)->quantity_returned == 0;
                })
                ->map(function ($inv) {
                    return [
                        'item_name'         => $inv->item->item_name ?? null,
                        'quantity_assigned' => $inv->quantity_assigned,
                    ];
                });
        }

        $finishedEvents = EventBooking::where('booking_status', 'finished')
            ->whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->count();

        return response()->json([
            'total_events'   => $totalEvents,
            'call_time'         => $callTime,
            'inventory_updates' => $inventoryItems,
            'finished_events'   => $finishedEvents,
            'setup_checklist'   => $setupChecklist,
        ]);
    }*/

    public function getWaiterStats(Request $request)
    {
        $userId = $request->user()->id;
        $today = now()->toDateString();

        $totalEvents = EventBooking::whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->count();

        $upcomingEvent = EventBooking::whereDate('event_date', $today)
            ->whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->whereNotIn('event_booking.booking_status', ['Finished', 'Cancelled'])
            ->with(['bookingInventory.item', 'bookingInventory.usage'])
            ->orderBy('event_date', 'asc')
            ->orderBy('event_start_time', 'asc')
            ->first();

        $setupChecklist = collect();
        $callTime = "N/A";
        $inventoryItems = "N/A";

        if ($upcomingEvent) {
            $startDateTime = \Carbon\Carbon::parse($upcomingEvent->event_date . ' ' . $upcomingEvent->event_start_time);
            $callTime = $startDateTime->copy()->subHours(2)->format('Y-m-d H:i:s');

            $setupChecklist->push([
                'event_name'      => $upcomingEvent->event_name ?? 'N/A',
                'event_date'    => $upcomingEvent->event_date,
                'event_start'   => $upcomingEvent->event_start_time,
                'call_time'     => $callTime,
                'inventory'     => $upcomingEvent->bookingInventory->map(function ($inv) {
                    return [
                        'item_name'        => $inv->item->item_name ?? null,
                        'quantity_assigned'=> $inv->quantity_assigned,
                        'quantity_returned'=> optional($inv->usage)->quantity_returned ?? 0,
                    ];
                }),
                'waiters'     => $upcomingEvent->waiter_count
            ]);

            $inventoryItems = $upcomingEvent->bookingInventory
                ->filter(function ($inv) {
                    return optional($inv->usage)->quantity_returned == 0;
                })
                ->map(function ($inv) {
                    return [
                        'item_name'         => $inv->item->item_name ?? null,
                        'quantity_assigned' => $inv->quantity_assigned,
                    ];
                });
        }

        $finishedEvents = EventBooking::where('booking_status', 'finished')
            ->whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->count();

        return response()->json([
            'total_events'   => $totalEvents,
            'call_time'         => $callTime,
            'inventory_updates' => $inventoryItems,
            'finished_events'   => $finishedEvents,
            'setup_checklist'   => $setupChecklist,
        ]);
    }

    public function getClientStats(Request $request)
    {
        $userId = $request->user()->customer_id;

        $event = EventBooking::with(['package', 'theme', 'payments'])
            ->where('customer_id', $userId)
            ->whereDate('event_date', '>=', now())
            ->orderBy('event_date', 'asc')
            ->first();

        if (!$event) {
            return response()->json([
                'days_left' => 0,
                'remaining_balance' => 0,
                'contact' => null,
                'event' => null,
                'payments' => [],
            ]);
        }

        $eventDate = Carbon::parse($event->event_date);

        $eventDate = Carbon::parse($event->event_date);

        if (now()->greaterThan($eventDate)) {
            $timeLeft = "Event already started/ended";
        } else {
            $daysLeft = now()->floatDiffInDays($eventDate);

            if ($daysLeft >= 1) {
                $timeLeft = number_format($daysLeft, 2) . " day" . ($daysLeft >= 2 ? "s" : "");
            } else {
                $hoursLeft = now()->floatDiffInHours($eventDate);

                if ($hoursLeft >= 1) {
                    $timeLeft = number_format($hoursLeft, 2) . " hour" . ($hoursLeft >= 2 ? "s" : "");
                } else {
                    $minutesLeft = now()->floatDiffInMinutes($eventDate);
                    $timeLeft = number_format($minutesLeft, 2) . " minute" . ($minutesLeft >= 2 ? "s" : "");
                }
            }
        }

        $totalPaid = $event->payments->sum('amount_paid');
        $remainingBalance = $event->event_total_price - $totalPaid;

        $contactName = $event->watcher;

        $start = Carbon::parse($event->event_date . ' ' . $event->event_start_time);
        $end   = $event->event_end_time 
            ? Carbon::parse($event->event_date . ' ' . $event->event_end_time) 
            : null;

        $datetime = $end
            ? $start->format('F j, Y - g:iA') . ' – ' . $end->format('g:iA')
            : $start->format('F j, Y - g:iA');

        $eventDetails = [
            'bookingId' => $event->booking_id,
            'title'    => $event->event_name,
            'venue'    => $event->event_location,
            'datetime' => $datetime,
            'package'  => $event->package ? $event->package->package_name : null,
            'theme'    => $event->theme ? $event->theme->theme_name : null,
            'notes'    => $event->special_request ? $event->special_request : null,
        ];

        $payments = $event->payments->sortByDesc('payment_date')->map(function ($p) {
            return [
                'date'   => date('F j', strtotime($p->payment_date)),
                'amount' => number_format($p->amount_paid, 2),
                'method' => ucfirst($p->payment_method),
            ];
        })->values();

        return response()->json([
            'days_left'         => $timeLeft,
            'remaining_balance' => $remainingBalance,
            'contact'           => $contactName,
            'event'             => $eventDetails,
            'payments'          => $payments,
        ]);
    }

    public function getAuditLog()
    {
        $logs = \App\Models\AuditLog::with('auditable')
            ->orderByDesc('auditlog_id')
            ->take(10)
            ->get()
            ->transform(function ($log) {
                $auditable = $log->auditable;

                if ($auditable) {
                    if ($log->auditable_type === 'App\Models\User') {
                        $log->user_name = trim(($auditable->first_name ?? '') . ' ' . ($auditable->middle_name ? $auditable->middle_name . ' ' : '') . ($auditable->last_name ?? '')) ?: 'Guest';
                        $log->role = $auditable->role ?? '-';
                    }
                    elseif ($log->auditable_type === 'App\Models\Customer') {
                        $log->user_name = trim(($auditable->customer_firstname ?? '') . ' ' . ($auditable->customer_middlename ? $auditable->customer_middlename . ' ' : '') . ($auditable->customer_lastname ?? '')) ?: 'N/A';
                        $log->role = 'client';
                    }
                    else {
                        $log->user_name = $auditable->name ?? 'N/A';
                        $log->role = $auditable->role ?? '-';
                    }
                } else {
                    $log->user_name = 'Guest';
                    $log->role = '-';
                }

                return $log;
            });

        return response()->json($logs);
    }

}