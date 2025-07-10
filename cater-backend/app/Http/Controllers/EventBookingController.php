<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\EventBooking;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\StaffAssignment;
use App\Models\Menu;

class EventBookingController extends Controller
{
    public function calendarEvents()
    {
        $events = EventBooking::select('booking_id', 'event_name as title', 'event_date as date')
            ->where('event_date', '>=', now())
            ->get();

        return response()->json($events);
    }

    public function index(Request $request)
    {
        $bookings = EventBooking::with('customer')
                    ->orderBy('booking_id', 'desc')
                    ->paginate(10);

        return response()->json([
            'bookings' => $bookings->items(),
            'pagination' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }
    public function indexSelected($id)
    {
        $booking = EventBooking::with([
            'customer',
            'menu.foods',
            'package',
            'theme',
            'staffAssignments.user',
            'tasks',
            'payments'
        ])->find($id);


        if (!$booking) {
            return response()->json(['message' => 'Event booking not found'], 404);
        }

        return response()->json([
            'booking' => $booking
        ]);
    }
    protected function generateAutoTasks($booking, $assignedUserIds, $creatorId)
    {
        $users = User::whereIn('id', $assignedUserIds)->get();

        foreach ($users as $user) {
            switch ($user->role) {
                case 'admin':
                    $tasks = [
                        'Explain Menu and Packages',
                        'Setup Group Chat',
                        'Log Downpayment',
                        'Monitor Event',
                        'Collect Feedback',
                    ];
                    break;

                case 'stylist':
                    $tasks = [
                        'Sketch Layout Based on Client Preferences',
                        'Inventory Check (Stylist)',
                        'Setup Venue and Send Photo',
                    ];
                    break;

                case 'cook':
                    $tasks = [
                        'Prepare Food for Event',
                        'Deliver Food to Venue',
                    ];
                    break;

                case 'head waiter':
                    $tasks = [
                        'Check Venue Setup',
                        'Inventory Check (Waiter)',
                        'Setup Equipment at Venue',
                        'Serve Food During Event',
                        'Pack-up Equipment',
                    ];
                    break;

                default:
                    $tasks = [];
            }

            foreach ($tasks as $title) {
                Task::create([
                    'booking_id' => $booking->booking_id,
                    'assigned_to' => $user->id,
                    'created_by' => $creatorId,
                    'title' => $title,
                    'description' => null,
                    'status' => 'To-Do',
                    'priority' => 'Normal',
                    'due_date' => $booking->event_date,
                    'auto_generated' => true,
                ]);
            }
        }
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string',
            'event_type' => 'nullable|string',
            'event_date' => 'required|date',
            'event_start_time' => 'required',
            'event_end_time' => 'required',
            'event_location' => 'required|string',
            'celebrant_name' => 'nullable|string',
            'age' => 'nullable|integer',
            'watcher' => 'required|string',
            'waiter_count' => 'required|integer',
            'pax' => 'required|integer',
            'package_id' => 'required|integer',
            'food_ids' => 'required|array',
            'food_ids.*' => 'integer|exists:food,food_id',
            'theme_id' => 'required|integer',
            'event_total_price' => 'required|numeric',
            'price_breakdown' => 'required|array',
            'freebies' => 'nullable|string',
            'special_request' => 'nullable|string',

            'customer_email' => 'required|email',
            'customer_firstname' => 'required|string',
            'customer_lastname' => 'required|string',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',

            'assigned_user_ids' => 'required|array',
            'assigned_user_ids.*' => 'integer',

            'created_by' => 'required|integer|exists:users,id',
        ]);
        
        DB::beginTransaction();

        try {

            $menu = Menu::create([
                'menu_name' => $validated['event_name'] . ' Menu',
                'menu_description' => 'Auto-generated menu for this booking',
                'menu_price' => $validated['event_total_price']
            ]);

            $menu->foods()->sync($validated['food_ids']);

            $conflict = EventBooking::where('event_date', $validated['event_date'])
                ->where(function ($q) use ($validated) {
                    $q->whereBetween('event_start_time', [$validated['event_start_time'], $validated['event_end_time']])
                    ->orWhereBetween('event_end_time', [$validated['event_start_time'], $validated['event_end_time']]);
                })->exists();

            if ($conflict) {
                return response()->json(['message' => 'Time slot not available'], 409);
            }

            $customer = Customer::firstOrCreate(
                ['customer_email' => $validated['customer_email']],
                [
                    'customer_firstname' => $validated['customer_firstname'],
                    'customer_lastname' => $validated['customer_lastname'],
                    'customer_middlename' => $request->customer_middlename,
                    'customer_password' => Hash::make($validated['customer_lastname'] . '.123'),
                    'customer_phone' => $validated['customer_phone'],
                    'customer_address' => $validated['customer_address'],
                ]
            );

            $booking = EventBooking::create([
                'customer_id' => $customer->customer_id,
                'package_id' => $validated['package_id'],
                'menu_id' => $menu->menu_id,
                'theme_id' => $validated['theme_id'],
                'event_name' => $validated['event_name'],
                'event_type' => $request->event_type,
                'event_date' => $validated['event_date'],
                'event_start_time' => $validated['event_start_time'],
                'event_end_time' => $validated['event_end_time'],
                'event_location' => $validated['event_location'],
                'celebrant_name' => $request->celebrant_name,
                'age' => $request->age,
                'watcher' => $validated['watcher'],
                'waiter_count' => $validated['waiter_count'],
                'pax' => $validated['pax'],
                'event_total_price' => $validated['event_total_price'],
                'price_breakdown' => json_encode($validated['price_breakdown']),
                'freebies' => $request->freebies,
                'special_request' => $request->special_request,
                'booking_status' => 'Pending',
            ]);

            foreach ($validated['assigned_user_ids'] as $userId) {
                StaffAssignment::create([
                    'booking_id' => $booking->booking_id,
                    'user_id' => $userId
                ]);
            }

            $this->generateAutoTasks($booking, $validated['assigned_user_ids'], $validated['created_by']);

            if ($request->filled('downpayment') && $request->downpayment > 0) {
                Payment::create([
                    'booking_id' => $booking->booking_id,
                    'amount_paid' => $request->downpayment,
                    'payment_method' => 'Cash',
                    'payment_date' => now(),
                    'payment_status' => 'Completed',
                    'remarks' => 'Downpayment',
                    'cash_given' => $request->downpayment,
                    'change_given' => 0,
                    'proof_image' => null,
                ]);
            }

            DB::commit();

            return response()->json(['message' => 'Booking and tasks successfully created.', 'booking' => $booking]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Booking creation failed.', 'error' => $e->getMessage()], 500);
        }
    }
    public function checkAvailability(Request $request)
    {
        $eventDate = $request->input('event_date');

        $proposedStart = Carbon::parse($request->input('event_start_time'))->subHours(2);
        $proposedEnd = Carbon::parse($request->input('event_end_time'));

        $conflicts = EventBooking::where('event_date', $eventDate)
            ->where(function ($query) use ($proposedStart, $proposedEnd) {
                $query->where(function ($q) use ($proposedStart, $proposedEnd) {
                    $q->whereRaw("ADDTIME(event_start_time, '-02:00:00') < ?", [$proposedEnd])
                    ->whereRaw("event_end_time > ?", [$proposedStart]);
                });
            })
            ->get();

        if ($conflicts->isNotEmpty()) {
            return response()->json([
                'available' => false,
                'conflicting_bookings' => $conflicts
            ]);
        }

        return response()->json(['available' => true]);
    }
    public function finishEvent($id)
    {
        $booking = EventBooking::findOrFail($id);

        $booking->update([
            'booking_status' => 'Finished',
        ]);

        return response()->json(['message' => 'Event finished', 'event' => $booking]);
    }
    public function updateBooking(Request $request, $id)
    {
        $validated = $request->validate([
            'event_name' => 'required|string',
            'event_location' => 'required|string',
            'event_type' => 'nullable|string',
            'celebrant_name' => 'nullable|string',
            'age' => 'nullable|integer',
            'watcher' => 'nullable|string',
            'special_request' => 'nullable|string',
            'food_names' => 'required|array',
            'food_names.*' => 'string'
        ]);

        $booking = EventBooking::with('menu.foods')->findOrFail($id);

        $booking->update([
            'event_name' => $validated['event_name'],
            'event_location' => $validated['event_location'],
            'event_type' => $validated['event_type'],
            'celebrant_name' => $validated['celebrant_name'],
            'age' => $validated['age'],
            'watcher' => $validated['watcher'],
            'special_request' => $validated['special_request'],
        ]);

        $allFoods = \App\Models\Food::whereIn('food_name', $validated['food_names'])->pluck('food_id')->toArray();
        $booking->menu->foods()->sync($allFoods);

        return response()->json(['message' => 'Booking updated']);
    }
    public function cancelBooking(Request $request, $id)
    {
        $booking = EventBooking::with('tasks')->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        if ($booking->booking_status === 'Finished' || $booking->booking_status === 'Cancelled') {
            return response()->json(['message' => 'Cannot cancel this booking.'], 400);
        }

        DB::beginTransaction();

        try {
            $booking->update([
                'booking_status' => 'Cancelled',
            ]);

            foreach ($booking->tasks as $task) {
                $task->update(['status' => 'Cancelled']);
            }

            StaffAssignment::where('booking_id', $id)->delete();

            DB::commit();

            return response()->json(['message' => 'Booking cancelled successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Cancellation failed.', 'error' => $e->getMessage()], 500);
        }
    }
    public function reschedBooking(Request $request, $id)
    {
        $validated = $request->validate([
            'event_date' => 'required|date',
            'event_start_time' => 'required|date_format:H:i',
            'event_end_time' => 'required|date_format:H:i|after:event_start_time',
        ]);

        $booking = EventBooking::findOrFail($id);

        $conflict = EventBooking::where('event_date', $validated['event_date'])
            ->where('booking_id', '!=', $id)
            ->where(function ($q) use ($validated) {
                $q->whereBetween('event_start_time', [$validated['event_start_time'], $validated['event_end_time']])
                ->orWhereBetween('event_end_time', [$validated['event_start_time'], $validated['event_end_time']]);
            })
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'The selected time slot is already booked.'], 409);
        }

        DB::beginTransaction();

        try {
            $booking->update([
                'event_date' => $validated['event_date'],
                'event_start_time' => $validated['event_start_time'],
                'event_end_time' => $validated['event_end_time'],
            ]);

            Task::where('booking_id', $id)
                ->where('auto_generated', true)
                ->update(['due_date' => $validated['event_date']]);

            DB::commit();

            return response()->json(['message' => 'Booking successfully rescheduled.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Rescheduling failed.', 'error' => $e->getMessage()], 500);
        }
    }


}