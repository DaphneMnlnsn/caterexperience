<?php

namespace App\Http\Controllers;

use App\Models\EventBooking;
use Illuminate\Http\Request;

class EventBookingController extends Controller
{
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
        $booking = EventBooking::find($id);

        if (!$booking) {
            return response()->json(['message' => 'Event booking not found'], 404);
        }

        return response()->json([
            'booking' => $booking
        ]);
    }
}
