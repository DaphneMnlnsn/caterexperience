<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\EventBooking;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with(['booking.customer'])->orderBy('payment_date', 'desc')->get();
        return response()->json(['payments' => $payments]);
    }

    public function indexSelected($id)
    {
        $payment = Payment::with(['booking.customer'])->find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json(['payment' => $payment]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:event_booking,booking_id',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'payment_date' => 'required|date',
            'payment_status' => 'nullable|string',
            'proof_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'remarks' => 'nullable|string',
            'cash_given' => 'nullable|numeric|min:0',
            'change_given' => 'nullable|numeric|min:0',
        ]);

        $imagePath = null;
        if ($request->hasFile('proof_image')) {
            $imagePath = $request->file('proof_image')->store('proofs', 'public');
        }

        $payment = Payment::create([
            'booking_id' => $validated['booking_id'],
            'amount_paid' => $validated['amount_paid'],
            'payment_method' => $validated['payment_method'],
            'payment_date' => $validated['payment_date'],
            'payment_status' => $validated['payment_status'] ?? 'pending',
            'proof_image' => $imagePath,
            'remarks' => $validated['remarks'] ?? null,
            'cash_given' => $validated['cash_given'] ?? null,
            'change_given' => $validated['change_given'] ?? null,
        ]);

        return response()->json(['message' => 'Payment recorded successfully', 'payment' => $payment], 201);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $validated = $request->validate([
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'payment_date' => 'required|date',
            'payment_status' => 'nullable|string',
            'proof_image' => 'nullable|string',
            'remarks' => 'nullable|string',
            'cash_given' => 'nullable|numeric|min:0',
            'change_given' => 'nullable|numeric|min:0',
        ]);

        $payment->update([
            'amount_paid' => $validated['amount_paid'],
            'payment_method' => $validated['payment_method'],
            'payment_date' => $validated['payment_date'],
            'payment_status' => $validated['payment_status'] ?? $payment->payment_status,
            'proof_image' => $validated['proof_image'] ?? $payment->proof_image,
            'remarks' => $validated['remarks'] ?? $payment->remarks,
            'cash_given' => $validated['cash_given'] ?? $payment->cash_given,
            'change_given' => $validated['change_given'] ?? $payment->change_given,
        ]);

        return response()->json(['message' => 'Payment updated successfully', 'payment' => $payment]);
    }

    public function destroy($id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully'], 200);
    }
}