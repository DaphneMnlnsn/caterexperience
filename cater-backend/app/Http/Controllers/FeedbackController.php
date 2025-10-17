<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use App\Models\Feedback;
use App\Services\NotificationService;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:event_booking,booking_id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $feedback = Feedback::updateOrCreate(
            ['booking_id' => $request->booking_id],
            [
                'rating' => $request->rating,
                'comment' => $request->comment
            ]
        );

        NotificationService::sendFeedbackSubmitted($request->booking_id);

        AuditLogger::log('Updated', "Module: Event Booking | Submitted feedback for booking {$request->booking_id}");

        return response()->json([
            'message' => 'Feedback submitted successfully.',
            'data' => $feedback
        ]);
    }

    public function indexSelected($booking_id)
    {
        $feedback = Feedback::where('booking_id', $booking_id)->first();

        if (!$feedback) {
            return response()->json([
                'message' => 'No feedback submitted yet.'
            ], 404);
        }

        return response()->json([
            'data' => $feedback
        ]);
    }

    public function index()
    {
        $feedbacks = Feedback::with('booking')->get();
        return response()->json([
            'data' => $feedbacks
        ]);
    }
}