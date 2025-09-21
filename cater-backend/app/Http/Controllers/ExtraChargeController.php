<?php

namespace App\Http\Controllers;

use App\Models\ExtraCharge;
use Illuminate\Http\Request;

class ExtraChargeController extends Controller
{
    public function index($bookingId)
    {
        return ExtraCharge::where('booking_id', $bookingId)->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'booking_id' => 'required|exists:event_booking,booking_id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        $charge = ExtraCharge::create($data);

        return response()->json($charge, 201);
    }

    public function update(Request $request, $id)
    {
        $charge = ExtraCharge::findOrFail($id);

        $data = $request->validate([
            'description' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
        ]);

        $charge->update($data);

        return response()->json($charge);
    }

    public function destroy($id)
    {
        $charge = ExtraCharge::findOrFail($id);
        $charge->delete();

        return response()->json(['message' => 'Charge deleted']);
    }
}
