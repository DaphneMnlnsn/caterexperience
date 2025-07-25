<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BookingInventory;
use App\Models\EventInventoryUsage;
use App\Models\Inventory;
use Illuminate\Support\Facades\DB;

class BookingInventoryController extends Controller
{
    public function index($id)
    {
        $summary = BookingInventory::with(['item', 'usage'])
            ->where('booking_id', $id)
            ->get()
            ->map(function ($row) {
                return [
                    'booking_inventory_id' => $row->booking_inventory_id,
                    'item_name' => $row->item->item_name,
                    'quantity_assigned' => $row->quantity_assigned,
                    'quantity_used' => $row->usage->quantity_used ?? null,
                    'quantity_returned' => $row->usage->quantity_returned ?? null,
                    'remarks' => $row->usage->remarks ?? null,
                ];
            });

        return response()->json($summary);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:event_booking,booking_id',
            'item_id' => 'required|exists:inventory,item_id',
            'quantity_assigned' => 'required|integer|min:1',
            'remarks' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            $bookingInventory = BookingInventory::create([
                'booking_id' => $validated['booking_id'],
                'item_id' => $validated['item_id'],
                'quantity_assigned' => $validated['quantity_assigned'],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            EventInventoryUsage::create([
                'booking_inventory_id' => $bookingInventory->booking_inventory_id,
                'quantity_used' => 0,
                'quantity_returned' => 0,
                'remarks' => null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Inventory assigned and usage row created',
                'data' => $bookingInventory,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to assign inventory',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $inventory = BookingInventory::findOrFail($id);

        $validated = $request->validate([
            'quantity_assigned' => 'required|integer|min:1',
            'remarks' => 'nullable|string',
        ]);

        $inventory->update($validated);

        return response()->json(['message' => 'Inventory item updated successfully', 'inventory' => $inventory->load('item')]);
    }
    
    public function updateUsage(Request $request, $bookingInventoryId)
    {
        $validated = $request->validate([
            'quantity_used' => 'nullable|numeric|min:0',
            'quantity_returned' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $usage = EventInventoryUsage::updateOrCreate(
            ['booking_inventory_id' => $bookingInventoryId],
            [
                'quantity_used' => $validated['quantity_used'] ?? 0,
                'quantity_returned' => $validated['quantity_returned'] ?? 0,
                'remarks' => $validated['remarks'] ?? null,
            ]
        );

        return response()->json(['message' => 'Usage saved.', 'usage' => $usage]);
    }

    public function destroy($id)
    {
        $inventory = BookingInventory::find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $inventory->delete();

        return response()->json(['message' => 'Inventory item deleted successfully'], 200);
    }
}