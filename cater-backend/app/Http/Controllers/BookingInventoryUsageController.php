<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EventInventoryUsage;

class BookingInventoryUsageController extends Controller
{
    public function index($bookingId)
    {
        $usage = EventInventoryUsage::with('item')
            ->where('booking_id', $bookingId)
            ->get();

        return response()->json(['usage' => $usage]);
    }

    public function update(Request $request, $id)
    {
        $usage = EventInventoryUsage::where('booking_inventory_id', $id)->firstOrFail();

        $usage->update([
            'quantity_used' => $request->quantity_used,
            'quantity_returned' => $request->quantity_returned,
            'remarks' => $request->remarks,
        ]);

        return response()->json(['message' => 'Usage updated', 'usage' => $usage]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|integer',
            'item_id' => 'required|integer',
            'quantity_used' => 'required|integer|min:0',
            'quantity_returned' => 'required|integer|min:0',
            'remarks' => 'nullable|string'
        ]);

        $usage = EventInventoryUsage::create($validated);
        return response()->json(['message' => 'Usage logged', 'usage' => $usage]);
    }

}
