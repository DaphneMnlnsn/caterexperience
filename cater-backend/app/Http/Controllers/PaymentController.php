<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\EventBooking;
use Illuminate\Support\Facades\DB;

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
    public function generateReport(Request $request)
    {
        $query = DB::table('payment')
            ->join('event_booking', 'payment.booking_id', '=', 'event_booking.booking_id')
            ->join('customers', 'event_booking.customer_id', '=', 'customers.customer_id')
            ->select(
                'payment.payment_id',
                'payment.amount_paid',
                'payment.payment_method',
                'payment.payment_date',
                'payment.remarks',
                DB::raw("CONCAT_WS(' ', customers.customer_firstname, customers.customer_middlename, customers.customer_lastname) as customer_name") // FIXED LINE
            );

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('payment.payment_date', [$request->start_date, $request->end_date]);
        }

        if ($request->filled('client_name')) {
            $query->where(DB::raw("CONCAT_WS(' ', customers.customer_firstname, customers.customer_middlename, customers.customer_lastname)"), 'like', '%' . $request->client_name . '%');
        }

        if ($request->filled('payment_method')) {
            $query->where('payment.payment_method', $request->payment_method);
        }

        $payments = $query->orderBy('payment.payment_date', 'desc')->get();

        $pdf = Pdf::loadView('reports.finance', [
            'payments' => $payments,
            'startDate' => $request->start_date,
            'endDate' => $request->end_date,
            'search' => $request->client_name,
            'method' => $request->payment_method,
        ]);

        return $pdf->stream('finance-report.pdf');
    }
}