<?php

namespace App\Http\Controllers;

use App\Models\ExtraCharge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        DB::statement('CALL recompute_booking_total(?)', [$data['booking_id']]);

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

        DB::statement('CALL recompute_booking_total(?)', [$charge->booking_id]);

        return response()->json($charge);
    }

    public function destroy($id)
    {
        $charge = ExtraCharge::findOrFail($id);
        $bookingId = $charge->booking_id;
        $charge->delete();

        DB::statement('CALL recompute_booking_total(?)', [$bookingId]);

        return response()->json(['message' => 'Charge deleted']);
    }
}
