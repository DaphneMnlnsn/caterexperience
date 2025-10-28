<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\AddonPrice;
use App\Models\BookingInventory;
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
use App\Models\EventAddon;
use App\Models\EventInventoryUsage;
use App\Models\Food;
use App\Models\PackagePrice;
use App\Models\VenueSetup;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class EventBookingController extends Controller
{
    public function calendarEvents(Request $request)
    {
        $user = $request->user();

        $query = EventBooking::select(
                'event_booking.event_code',
                'event_booking.event_name as title',
                'event_booking.event_date as date'
            )
            ->where('event_booking.event_date', '>=', now())
            ->where('event_booking.booking_status', '!=', 'Cancelled');

        if (strtolower($user->role) !== 'admin') {
            $query->whereHas('staffAssignments', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $events = $query->get();

        return response()->json($events);
    }

    public function index(Request $request)
    {
        $bookings = EventBooking::with('customer')
                    ->orderBy('booking_id', 'desc')
                    ->get();

        AuditLogger::log('Viewed', 'Module: Event Booking | Viewed booking list');

        return response()->json([
            'bookings' => $bookings
        ]);
    }

    public function indexAssigned(Request $request)
    {
        $accessToken = $request->bearerToken();
        $token = PersonalAccessToken::findToken($accessToken);
        $user = $token?->tokenable;

        $query = EventBooking::with('customer');

        if ($user instanceof User) {
            $query->whereHas('staffAssignments', fn($q) => $q->where('user_id', $user->id));
        } elseif ($user instanceof Customer) {
            $query->where('customer_id', $user->customer_id);
        } else {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        if ($status = $request->query('status')) {
            $query->where('booking_status', $status);
        }
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('event_name', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($cq) use ($search) {
                    $cq->where('customer_firstname', 'like', "%{$search}%")
                        ->orWhere('customer_middlename', 'like', "%{$search}%")
                        ->orWhere('customer_lastname', 'like', "%{$search}%");
                });
            });
        }

        $bookings = $query
        ->orderBy('event_date', 'asc')
        ->orderBy('event_start_time', 'asc')
        ->paginate($request->per_page ?? 5);

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

    public function indexSelected(Request $request, $id)
    {
        $accessToken = $request->bearerToken();
        $token = PersonalAccessToken::findToken($accessToken);
        $user = $token?->tokenable;

        $booking = EventBooking::with([
            'customer',
            'menu.foods',
            'package',
            'packagePrice',
            'theme',
            'staffAssignments.user',
            'payments',
            'eventAddons.addon',
            'eventAddons.addonPrice',
            'extraCharges'
        ])->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Event booking not found'], 404);
        }

        if ($user instanceof User && strtolower($user->role) === 'admin') {
        }
        elseif ($user instanceof User) {
            $isAssigned = $booking->staffAssignments()->where('user_id', $user->id)->exists();
            if (!$isAssigned) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        elseif ($user instanceof Customer) {
            if ($booking->customer_id !== $user->customer_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tasks = $booking->tasks()
            ->when($user instanceof User && strtolower($user->role) !== 'admin', function ($q) use ($user, $booking) {
                if (strtolower($user->role) === 'head waiter') {
                    $headWaiterIds = $booking->staffAssignments()
                        ->whereHas('user', fn($u) => $u->where('role', 'head waiter'))
                        ->pluck('user_id');

                    $q->whereIn('assigned_to', $headWaiterIds);
                } else {
                    $q->where('assigned_to', $user->id);
                }
            })
            ->with('assignee')
            ->get();

        $booking->setRelation('tasks', $tasks);

        if ($booking->tasks instanceof \Illuminate\Support\Collection) {
            $booking->tasks = $booking->tasks->values();
        }

        return response()->json(['booking' => $booking]);
    }

    public function getByEventCode(Request $request, $eventCode)
    {
        $accessToken = $request->bearerToken();
        $token = PersonalAccessToken::findToken($accessToken);
        $user = $token?->tokenable;

        $booking = EventBooking::with([
            'customer',
            'menu.foods',
            'package',
            'packagePrice',
            'theme',
            'staffAssignments.user',
            'payments',
            'eventAddons.addon',
            'eventAddons.addonPrice',
            'extraCharges'
        ])
        ->where('event_code', $eventCode)
        ->firstOrFail();

        if (!$booking) {
            return response()->json(['message' => 'Event booking not found'], 404);
        }

        if ($user instanceof User && strtolower($user->role) === 'admin') {
        }
        elseif ($user instanceof User) {
            $isAssigned = $booking->staffAssignments()->where('user_id', $user->id)->exists();
            if (!$isAssigned) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        elseif ($user instanceof Customer) {
            if ($booking->customer_id !== $user->customer_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tasks = $booking->tasks()
            ->when($user instanceof User && strtolower($user->role) !== 'admin', function ($q) use ($user, $booking) {
                if (strtolower($user->role) === 'head waiter') {
                    $headWaiterIds = $booking->staffAssignments()
                        ->whereHas('user', fn($u) => $u->where('role', 'head waiter'))
                        ->pluck('user_id');

                    $q->whereIn('assigned_to', $headWaiterIds);
                } else {
                    $q->where('assigned_to', $user->id);
                }
            })
            ->with('assignee')
            ->get();

        $booking->setRelation('tasks', $tasks);

        if ($booking->tasks instanceof \Illuminate\Support\Collection) {
            $booking->tasks = $booking->tasks->values();
        }

        return response()->json(['booking' => $booking]);
    }

    public function findByCode(Request $request, $code)
    {
        $booking = EventBooking::with([
            'customer',
            'menu.foods',
            'package',
            'packagePrice',
            'theme',
            'staffAssignments.user',
            'payments',
            'eventAddons.addon',
            'eventAddons.addonPrice'
        ])->where('event_code', $code)->first();

        if (!$booking) {
            return response()->json(['message' => 'Event booking not found'], 404);
        }
        return response()->json(['booking' => $booking]);
    }

    public function indexSelectedPublic(Request $request, $id)
    {
        $booking = EventBooking::with([
            'customer',
            'menu.foods',
            'package',
            'packagePrice',
            'theme',
            'staffAssignments.user',
            'payments',
            'eventAddons.addon',
            'eventAddons.addonPrice'
        ])->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Event booking not found'], 404);
        }

        return response()->json(['booking' => $booking]);
    }

    protected function generateAutoTasks($booking, $assignedUserIds, $creatorId)
    {
        $users = User::whereIn('id', $assignedUserIds)->get();
        $eventDateTime = Carbon::parse($booking->event_date . ' ' . $booking->event_start_time);

        foreach ($users as $user) {
            switch ($user->role) {
                case 'admin':
                    $tasks = [
                        ['Setup Group Chat', $eventDateTime->copy()->subDays(8)->setTime(9, 0)],
                        ['Log Downpayment', $eventDateTime->copy()->subDays(8)->setTime(12, 0)],
                        ['Monitor Event', $eventDateTime->copy()->setTime(8, 0)],
                        ['Collect Feedback', $eventDateTime->copy()->addDay()->setTime(17, 0)],
                    ];
                    break;

                case 'stylist':
                    $tasks = [
                        ['Sketch Layout Based on Client Preferences', $eventDateTime->copy()->subDays(5)->setTime(10, 0)],
                        ['Inventory Check (Stylist)', $eventDateTime->copy()->subDays(1)->setTime(14, 0)],
                        ['Setup Venue and Send Photo', $eventDateTime->copy()->subHours(3)],
                    ];
                    break;

                case 'cook':
                    $tasks = [
                        ['Prepare Food for Event', $eventDateTime->copy()->subHours(3)],
                        ['Deliver Food to Venue', $eventDateTime->copy()->subHours(1)],
                    ];
                    break;

                case 'head waiter':
                    if ($user->id === $users->where('role', 'head waiter')->first()->id) {
                        $tasks = [
                            ['Check Venue Setup', $eventDateTime->copy()->subHours(2)],
                            ['Inventory Check (Waiter)', $eventDateTime->copy()->subHours(3)],
                            ['Setup Equipment at Venue', $eventDateTime->copy()->subHours(1)],
                            ['Serve Food During Event', $eventDateTime->copy()],
                            ['Pack-up Equipment', $eventDateTime->copy()->addHours(3)],
                        ];

                        foreach ($tasks as [$title, $dueDateTime]) {
                            Task::create([
                                'booking_id'   => $booking->booking_id,
                                'assigned_to'  => $user->id,
                                'created_by'   => $creatorId,
                                'title'        => $title,
                                'status'       => 'To-Do',
                                'priority'     => 'Normal',
                                'due_date'     => $dueDateTime,
                                'auto_generated' => true,
                            ]);
                        }
                    }
                    continue 2;

                default:
                    $tasks = [];
            }

            foreach ($tasks as [$title, $dueDateTime]) {
                Task::create([
                    'booking_id' => $booking->booking_id,
                    'assigned_to' => $user->id,
                    'created_by' => $creatorId,
                    'title' => $title,
                    'description' => null,
                    'status' => 'To-Do',
                    'priority' => 'Normal',
                    'due_date' => $dueDateTime,
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
            'package_price_id' => 'required|integer|exists:package_price,package_price_id',
            'food_ids' => 'required|array',
            'food_ids.*' => 'integer|exists:food,food_id',
            'theme_id' => 'nullable|integer',
            'event_total_price' => 'required|numeric',
            'price_breakdown' => 'required|array',
            'freebies' => 'nullable|string',
            'special_request' => 'nullable|string',

            'event_addons.*.addon_id' => 'nullable|integer|exists:addons,addon_id',
            'event_addons.*.addon_price_id' => 'nullable|integer|exists:addon_prices,addon_price_id',
            'event_addons.*.quantity' => 'nullable|integer|min:1',
            'event_addons.*.total_price' => 'nullable|numeric|min:0',

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
                ->whereNotIn('booking_status', ['Cancelled', 'Finished'])
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
                    'require_pass_change' => true,
                ]
            );

            $isNewCustomer = $customer->wasRecentlyCreated;

            $booking = EventBooking::create([
                'customer_id' => $customer->customer_id,
                'package_id' => $validated['package_id'],
                'package_price_id' => $validated['package_price_id'],
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

            if ($request->has('event_addons')) {
                foreach ($request->input('event_addons', []) as $addonData) {
                    $addon = (array) $addonData;
                    $price = AddonPrice::find($addon['addon_price_id']);

                    EventAddon::create([
                        'booking_id'      => $booking->booking_id,
                        'addon_id'        => $addon['addon_id'],
                        'addon_price_id'  => $addon['addon_price_id'],
                        'quantity'        => $addon['quantity'],
                        'total_price'     => $addon['total_price'],
                    ]);
                }
            }

            if ($request->filled('downpayment') && $request->downpayment > 0) {
                Payment::create([
                    'booking_id' => $booking->booking_id,
                    'amount_paid' => $request->downpayment,
                    'payment_method' => 'Cash',
                    'payment_date' => now(),
                    'payment_status' => 'Completed',
                    'remarks' => 'Reservation Fee',
                    'cash_given' => $request->downpayment,
                    'change_given' => 0,
                    'proof_image' => null,
                ]);
            }

            $layoutType = in_array($validated['event_location'], [
                'Pavilion',
                'Airconditioned Room',
                'Poolside'
            ]) ? $validated['event_location'] : 'Custom Venue';

            VenueSetup::create([
                'booking_id'   => $booking->booking_id,
                'layout_name'  => $validated['event_name'] . ' Layout',
                'layout_type'  => $layoutType,
                'status'       => 'pending',
            ]);

            DB::commit();

            AuditLogger::log('Created', 'Module: Event Booking | Created booking: ' . $validated['event_name']);

            foreach ($validated['assigned_user_ids'] as $userId) {
                NotificationService::sendTaskAssigned($userId, $booking);
            }

            $message = 'Booking and tasks successfully created.';
            if ($isNewCustomer) {
                $message .= ' A new client account was also created. Default password: ' . $validated['customer_lastname'] . '.123';
            }

            return response()->json([
                'message' => $message,
                'booking' => $booking,
                'new_customer' => $isNewCustomer,
            ]);
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
            ->whereNotIn('booking_status', ['Cancelled', 'Finished'])
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

        AuditLogger::log('Updated', 'Module: Event Booking | Finished booking ID: ' . $id);

        return response()->json(['message' => 'Event finished', 'event' => $booking]);
    }
    public function updateBooking(Request $request, $id)
    {
        $validated = $request->validate([
            'event_name'      => 'required|string',
            'event_location'  => 'required|string',
            'event_type'      => 'nullable|string',
            'celebrant_name'  => 'nullable|string',
            'age'             => 'nullable|integer',
            'watcher'         => 'nullable|string',
            'special_request' => 'nullable|string',
            'food_names'      => 'required|array',
            'food_names.*'    => 'string',
            'freebies' => 'nullable|string',
            'event_addons' => 'nullable|array',
            'event_addons.*.addon_id' => 'required|integer|exists:addons,addon_id',
            'event_addons.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $booking = EventBooking::with(['menu.foods', 'customer', 'staffAssignments'])
                ->findOrFail($id);

            $booking->update([
                'event_name'      => $validated['event_name'],
                'event_location'  => $validated['event_location'],
                'event_type'      => $validated['event_type'],
                'celebrant_name'  => $validated['celebrant_name'],
                'age'             => $validated['age'],
                'watcher'         => $validated['watcher'],
                'special_request' => $validated['special_request'],
                'freebies'        => $request->input('freebies'),
            ]);

            $allFoods = Food::whereIn('food_name', $validated['food_names'])
                ->pluck('food_id')
                ->toArray();
            $booking->menu->foods()->sync($allFoods);

            $layoutType = in_array($validated['event_location'], [
                'Pavilion', 'Airconditioned Room', 'Poolside'
            ]) ? $validated['event_location'] : 'Custom Venue';

            $venueSetup = VenueSetup::where('booking_id', $booking->booking_id)->first();
            if ($venueSetup) {
                if ($venueSetup->layout_type !== $layoutType) {
                    $venueSetup->update([
                        'layout_type' => $layoutType,
                        'status' => 'pending'
                    ]);
                }
            } else {
                VenueSetup::create([
                    'booking_id'   => $booking->booking_id,
                    'layout_name'  => $validated['event_name'] . ' Layout',
                    'layout_type'  => $layoutType,
                    'status'       => 'pending',
                ]);
            }

            EventAddon::where('booking_id', $booking->booking_id)->delete();

            $totalAddons = 0;

            if ($request->filled('event_addons')) {
                foreach ($request->input('event_addons') as $addon) {
                    $addon = (array) $addon;

                    $addonId       = $addon['addon_id'] ?? null;
                    $addonPriceId  = $addon['addon_price_id'] ?? null;
                    $quantity      = isset($addon['quantity']) ? (int) $addon['quantity'] : 1;

                    if (!$addonId) {
                        continue;
                    }

                    $addonPrice = $addonPriceId ? AddonPrice::find($addonPriceId) : AddonPrice::where('addon_id', $addonId)->first();
                    $unitPrice = $addonPrice ? floatval($addonPrice->price ?? 0) : 0;
                    $lineTotal = $unitPrice * $quantity;

                    EventAddon::create([
                        'booking_id'     => $booking->booking_id,
                        'addon_id'       => $addonId,
                        'addon_price_id' => $addonPriceId,
                        'quantity'       => $quantity,
                        'total_price'    => $lineTotal,
                    ]);

                    $totalAddons += $lineTotal;
                }
            }

            DB::statement('CALL recompute_booking_total(?)', [$booking->booking_id]);

            AuditLogger::log('Updated', 'Module: Booking Details | Updated booking ID: ' . $id);

            DB::commit();

            NotificationService::sendBookingUpdated($booking->customer_id, $booking, true);

            foreach ($booking->staffAssignments as $assignment) {
                NotificationService::sendBookingUpdated($assignment->user_id, $booking);
            }

            return response()->json(['message' => 'Booking updated']);

        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
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

            foreach ($booking->menuFoods as $menuFood) {
                $menuFood->update(['status' => 'completed']);
            }

            DB::table('venue_setup')
                ->where('booking_id', $id)
                ->update(['status' => 'cancelled']);

            DB::commit();

            AuditLogger::log('Cancelled', 'Module: Event Booking | Cancelled booking ID: ' . $id);
            
            NotificationService::sendBookingCancelled($booking->customer_id, $booking, true);

            foreach ($booking->staffAssignments as $assignment) {
                NotificationService::sendBookingCancelled($assignment->user_id, $booking);
            }

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

        $booking = EventBooking::with(['packagePrice', 'eventAddons', 'tasks.assignee', 'staffAssignments'])->findOrFail($id);

        $conflict = EventBooking::where('event_date', $validated['event_date'])
            ->where('booking_id', '!=', $id)
            ->whereNotIn('booking_status', ['Cancelled', 'Finished'])
            ->where(function ($q) use ($validated) {
                $q->where(function ($q2) use ($validated) {
                    $q2->where('event_start_time', '<', $validated['event_end_time'])
                    ->where('event_end_time', '>', $validated['event_start_time']);
                });
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

            $eventDate = $validated['event_date'];
            $start = Carbon::parse("$eventDate {$validated['event_start_time']}");
            $end = Carbon::parse("$eventDate {$validated['event_end_time']}");

            if ($end->lte($start)) {
                $end->addDay();
            }

            $eventDateTime = Carbon::parse("{$validated['event_date']} {$validated['event_start_time']}");
            foreach ($booking->tasks as $task) {
                if (!$task->auto_generated || !$task->assignee) continue;

                $role = strtolower($task->assignee->role);
                $map = [];

                switch ($role) {
                    case 'admin':
                        $map = [
                            'Setup Group Chat' => $eventDateTime->copy()->subDays(8)->setTime(9, 0),
                            'Log Downpayment' => $eventDateTime->copy()->subDays(8)->setTime(12, 0),
                            'Monitor Event' => $eventDateTime->copy()->setTime(8, 0),
                            'Collect Feedback' => $eventDateTime->copy()->addDay()->setTime(17, 0),
                        ];
                        break;
                    case 'stylist':
                        $map = [
                            'Sketch Layout Based on Client Preferences' => $eventDateTime->copy()->subDays(5)->setTime(10, 0),
                            'Inventory Check (Stylist)' => $eventDateTime->copy()->subDay()->setTime(14, 0),
                            'Setup Venue and Send Photo' => $eventDateTime->copy()->setTime(7, 0),
                        ];
                        break;
                    case 'cook':
                        $map = [
                            'Prepare Food for Event' => $eventDateTime->copy()->subHours(3),
                            'Deliver Food to Venue' => $eventDateTime->copy()->subHour(),
                        ];
                        break;
                    case 'head waiter':
                        $map = [
                            'Check Venue Setup' => $eventDateTime->copy()->subHours(2),
                            'Inventory Check (Waiter)' => $eventDateTime->copy()->subHours(3),
                            'Setup Equipment at Venue' => $eventDateTime->copy()->subHour(),
                            'Serve Food During Event' => $eventDateTime->copy(),
                            'Pack-up Equipment' => $eventDateTime->copy()->addHours(3),
                        ];
                        break;
                }

                if (isset($map[$task->title])) {
                    $task->update(['due_date' => $map[$task->title]]);
                }
            }

            DB::commit();
            
            DB::statement('CALL recompute_booking_total(?)', [$booking->booking_id]);

            AuditLogger::log('Updated', 'Module: Event Booking | Rescheduled booking ID: ' . $id);

            NotificationService::sendBookingUpdated($booking->customer_id, $booking, true);
            foreach ($booking->staffAssignments as $assignment) {
                NotificationService::sendBookingUpdated($assignment->user_id, $booking);
            }

            return response()->json([
                'message' => 'Booking successfully rescheduled.',
                'booking' => $booking->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Rescheduling failed.', 'error' => $e->getMessage()], 500);
        }
    }
}