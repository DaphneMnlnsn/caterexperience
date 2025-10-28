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
            'total_events' => EventBooking::whereBetween('event_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])
            ->whereNotIn('booking_status', ['Cancelled', 'Finished'])
            ->count(),
            'pending_bookings' => EventBooking::where('booking_status', 'Pending')->count(),
            'pending_payments' => $bookingsWithBalance->count(),
            'staff_tasks' => Task::where('status', 'To-Do')->count(),
        ]);
    }

    public function getTodayEvents()
    {
        $today = Carbon::today();

        $events = EventBooking::whereDate('event_date', $today)
            ->whereNotIn('booking_status', ['Cancelled', 'Finished'])
            ->get(['booking_id', 'event_name', 'event_location', 'event_start_time', 'event_end_time'])
            ->map(function ($event) {
                return [
                    'id' => $event->booking_id,
                    'event_name' => $event->event_name,
                    'venue_name' => $event->event_location ?? 'N/A',
                    'start_time' => $event->event_start_time ? Carbon::parse($event->event_start_time)->format('g:iA') : '—',
                    'end_time' => $event->event_end_time ? Carbon::parse($event->event_end_time)->format('g:iA') : '—',
                    'tasks' => $event->tasks()
                        ->with('assignee')
                        ->get()
                        ->map(function ($task) {
                            return [
                                'title' => $task->title,
                                'status' => $task->status,
                                'assigned_to' => $task->assignee
                                    ? trim($task->assignee->first_name . ' ' . $task->assignee->last_name)
                                    : 'Unassigned',
                            ];
                        }),
                ];
            });

        return response()->json($events);
    }

    public function getStylistStats(Request $request)
    {
        $userId = $request->user()->id;

        $totalEvents = EventBooking::whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId)
                ->whereBetween('event_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
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
            ->orderByRaw("DATE_SUB(CONCAT(event_booking.event_date, ' ', event_booking.event_start_time), INTERVAL 7 DAY) ASC")
            ->get();

        return response()->json([
            'total_events' => $totalEvents,
            'setup_plans_due' => $setupPlansDue,
            'setup_plans_submitted' => $setupPlansSubmitted,
            'todo_tasks' => $todoTasks,
            'deadlines' => $deadlines,
        ]);
    }

    public function getStaffTodayEvents(Request $request)
    {
        $userId = $request->user()->id;
        $today = Carbon::today();

        $events = EventBooking::whereDate('event_date', $today)
            ->whereNotIn('booking_status', ['Cancelled', 'Finished'])
            ->whereHas('staffAssignments', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->with(['tasks.assignee'])
            ->get(['booking_id', 'event_code', 'event_name', 'event_location', 'event_start_time', 'event_end_time'])
            ->map(function ($event) use ($userId) {
                return [
                    'id' => $event->booking_id,
                    'event_code' => $event->event_code,
                    'event_name' => $event->event_name,
                    'venue_name' => $event->event_location ?? 'N/A',
                    'start_time' => $event->event_start_time
                        ? Carbon::parse($event->event_start_time)->format('g:iA')
                        : '—',
                    'end_time' => $event->event_end_time
                        ? Carbon::parse($event->event_end_time)->format('g:iA')
                        : '—',
                    'tasks' => $event->tasks
                        ->filter(fn($task) => $task->assigned_to === $userId)
                        ->map(function ($task) {
                            return [
                                'title' => $task->title,
                                'status' => $task->status,
                                'assigned_to' => $task->assignee
                                    ? trim($task->assignee->first_name . ' ' . $task->assignee->last_name)
                                    : 'Unassigned',
                            ];
                        })
                        ->values(),
                ];
            });

        return response()->json($events);
    }

    public function getCookStats(Request $request)
    {
        $userId = $request->user()->id;
    
        $totalEvents = DB::table('event_booking')
            ->join('staff_assignment', 'event_booking.booking_id', '=', 'staff_assignment.booking_id')
            ->where('staff_assignment.user_id', $userId)
            ->whereBetween('event_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])
            ->count();
    
        $menuItemsPending = DB::table('menu_food')
            ->join('menu', 'menu_food.menu_id', '=', 'menu.menu_id')
            ->join('event_booking', 'event_booking.menu_id', '=', 'menu_food.menu_id')
            ->join('staff_assignment', 'event_booking.booking_id', '=', 'staff_assignment.booking_id')
            ->where('staff_assignment.user_id', $userId)
            ->where('menu_food.status', 'pending')
            ->whereBetween('event_booking.event_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])
            ->count();
    
        $today = now()->toDateString();
        $threeDaysAhead = now()->addDays(3)->toDateString();
    
        $foodsToPrepare = DB::table('menu_food')
            ->join('menu', 'menu_food.menu_id', '=', 'menu.menu_id')
            ->join('event_booking', 'event_booking.menu_id', '=', 'menu_food.menu_id')
            ->join('food', 'menu_food.food_id', '=', 'food.food_id')
            ->join('staff_assignment', 'event_booking.booking_id', '=', 'staff_assignment.booking_id')
            ->where('staff_assignment.user_id', $userId)
            ->whereIn('event_booking.event_date', [$today, $threeDaysAhead])
            ->select(
                'event_booking.event_date',
                'event_booking.event_name',
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
            'menu_items_pending'   => $menuItemsPending,
            'foods_to_prepare'     => $foodsToPrepare,
        ]);
    }

    public function getWaiterStats(Request $request)
    {
        $userId = $request->user()->id;
        $today = now()->toDateString();

        $totalEvents = EventBooking::whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->whereBetween('event_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])
            ->count();

        $upcomingEvent = EventBooking::whereDate('event_date', $today)
            ->whereHas('tasks', function ($query) use ($userId) {
                $query->where('assigned_to', $userId);
            })
            ->whereNotIn('booking_status', ['Finished', 'Cancelled'])
            ->with(['bookingInventory.item', 'bookingInventory.usage'],'theme')
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
                'event_location'      => $upcomingEvent->event_location ?? 'N/A',
                'theme_name'      => $upcomingEvent->theme->theme_name ?? 'N/A',
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
            ->whereNotIn('booking_status', ['Finished', 'Cancelled'])
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

        if (now()->greaterThan($eventDate)) {
            $timeLeft = "Event already started/ended";
            $daysLeft = 0;
        } else {
            $daysLeft = now()->floatDiffInDays($eventDate);

            if ($daysLeft >= 1) {
                $timeLeft = number_format($daysLeft, 0) . " day" . ($daysLeft >= 2 ? "s" : "");
            } else {
                $hoursLeft = now()->floatDiffInHours($eventDate);

                if ($hoursLeft >= 1) {
                    $timeLeft = number_format($hoursLeft, 0) . " hour" . ($hoursLeft >= 2 ? "s" : "");
                } else {
                    $minutesLeft = now()->floatDiffInMinutes($eventDate);
                    $timeLeft = number_format($minutesLeft, 0) . " minute" . ($minutesLeft >= 2 ? "s" : "");
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
            'days_left'         => $daysLeft,
            'time_left'         => $timeLeft,
            'remaining_balance' => $remainingBalance,
            'contact'           => $contactName,
            'event'             => $eventDetails,
            'payments'          => $payments,
        ]);
    }
}