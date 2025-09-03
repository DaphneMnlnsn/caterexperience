<?php

namespace App\Http\Controllers;

use App\Models\BookingChangeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingChangeRequestController extends Controller
{
    public function store(Request $request, $bookingId)
    {

        $userId = $request->user()->customer_id;

        $validated = $request->validate([
            'request' => 'required|string|max:5000',
        ]);

        $changeRequest = BookingChangeRequest::create([
            'booking_id' => $bookingId,
            'customer_id' => $userId,
            'request_text' => $validated['request'],
        ]);

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

        return response()->json([
            'message' => 'Status updated successfully.',
            'data' => $changeRequest
        ]);
    }
}