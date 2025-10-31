<?php

namespace App\Http\Controllers;

use App\Models\BookingChangeRequest;
use App\Models\EventBooking;
use App\Notifications\BookingChangeRequestStatusNotification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingChangeRequestController extends Controller
{
    public function store(Request $request, $bookingId)
    {

        $userId = $request->user()->customer_id;

        $validated = $request->validate([
            'request' => 'required|string|max:5000',
            'changes' => 'nullable|array',
        ]);

        $changeRequest = BookingChangeRequest::create([
            'booking_id' => $bookingId,
            'customer_id' => $userId,
            'request_text' => $validated['request'],
            'changes' => isset($validated['changes']) ? json_encode($validated['changes']) : null,
        ]);

        NotificationService::sendBookingChangeRequest(
            $changeRequest->booking, 
            $validated['request']
        );

        return response()->json([
            'message' => 'Change request submitted successfully.',
            'data' => $changeRequest
        ], 201);
    }

    public function index($bookingId)
    {
        $requests = BookingChangeRequest::where('booking_id', $bookingId)
            ->with('customer')
            ->latest()
            ->get();

        return response()->json($requests);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,resolved',
        ]);

        $changeRequest = BookingChangeRequest::findOrFail($id);
        $changeRequest->update(['status' => $validated['status']]);

        if ($validated['status'] === 'approved' && !empty($changeRequest->changes)) {
            $changes = is_array($changeRequest->changes)
                ? $changeRequest->changes
                : json_decode($changeRequest->changes, true);

            $booking = $changeRequest->booking;
            if (!$booking) {
                return response()->json([
                    'message' => 'Booking not found for this change request.'
                ], 404);
            }

            $fillable = (new EventBooking)->getFillable();

            foreach ($changes as $field => $data) {
                $newValue = is_array($data) && array_key_exists('new', $data)
                    ? $data['new']
                    : $data;

                if ($field === 'menu_foods') {
                    $menu = $booking->menu;
                    if ($menu && is_array($newValue)) {
                        $foodIds = \App\Models\Food::whereIn('food_name', $newValue)->pluck('food_id')->toArray();
                        $menu->foods()->sync($foodIds);
                    }
                    continue;
                }

                if (in_array($field, $fillable)) {
                    $booking->$field = $newValue;
                }
            }

            $booking->save();
        }

        $customer = $changeRequest->customer;

        if ($customer) {
            $customer->notify(new BookingChangeRequestStatusNotification($changeRequest));
        }

        return response()->json([
            'message' => 'Status updated successfully.',
            'data' => $changeRequest
        ]);
    }
    public function pendingUpdate(Request $request, $id)
    {
        $booking = EventBooking::with('menu.foods')->findOrFail($id);
        $client = Auth::user();

        $validated = $request->validate([
            'changes' => 'required|array',
        ]);

        $original = $booking->toArray();
        $incoming = $validated['changes'];

        $diff = [];

        foreach ($incoming as $key => $value) {
            if (array_key_exists($key, $original) && $original[$key] != $value) {
                $diff[$key] = [
                    'old' => $original[$key],
                    'new' => $value,
                ];
            }
        }

        if (isset($incoming['menu_foods']) && is_array($incoming['menu_foods'])) {
            $currentFoodNames = $booking->menu->foods->pluck('food_name')->toArray();
            $newFoodNames = $incoming['menu_foods'];

            if ($currentFoodNames != $newFoodNames) {
                $diff['menu_foods'] = [
                    'old' => $currentFoodNames,
                    'new' => $newFoodNames,
                ];
            }
        }

        if (empty($diff)) {
            return response()->json(['message' => 'No actual changes detected.'], 200);
        }

        $fieldLabels = [
            'event_name' => 'Event Name',
            'event_type' => 'Event Type',
            'event_location' => 'Event Location',
            'event_start_time' => 'Event Start Time',
            'event_end_time' => 'Event End Time',
            'celebrant_name' => 'Celebrant Name',
            'age' => 'Age',
            'theme_id' => 'Theme',
            'menu_foods' => 'Menu Foods',
            'special_request' => 'Special Request',
        ];

        $prettyFields = collect(array_keys($diff))
            ->map(fn($f) => $fieldLabels[$f] ?? ucfirst($f))
            ->implode(', ');

        $requestText = 'Client requested updates to: ' . $prettyFields . '.';

        $changeRequest = BookingChangeRequest::create([
            'booking_id' => $booking->booking_id,
            'customer_id' => $client->customer_id,
            'changes' => $diff,
            'status' => 'pending',
            'request_text' => $requestText,
        ]);

        NotificationService::sendBookingChangeRequest($booking, $requestText);

        return response()->json(['message' => 'Changes submitted for approval.']);
    }
}