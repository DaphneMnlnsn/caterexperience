<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use App\Models\BookingInventory;
use App\Models\EventInventoryUsage;
use App\Models\Inventory;
use App\Models\User;
use App\Notifications\InventoryUsageUpdatedNotification;
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
                'quantity_used' => $validated['quantity_assigned'],
                'quantity_returned' => 0,
                'remarks' => null,
            ]);

            DB::commit();

            AuditLogger::log('Created', 'Module: Booking Details | Assigned item ID: ' . $validated['item_id'] . ' to Booking ID: ' . $validated['booking_id'] . ' (Qty: ' . $validated['quantity_assigned'] . ')');

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

        AuditLogger::log('Updated', 'Module: Booking Details | Updated item ID: ' . $inventory->item_id . ' for Booking ID: ' . $inventory->booking_id . ' (New Qty: ' . $validated['quantity_assigned'] . ')');

        return response()->json(['message' => 'Inventory item updated successfully', 'inventory' => $inventory->load('item')]);
    }
    
    public function updateUsage(Request $request, $bookingInventoryId)
    {
        $user = $request->user();

        $validated = $request->validate([
            'quantity_used' => 'nullable|numeric|min:0',
            'quantity_returned' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        if ($request->has('quantity_used') && strtolower($user->role) !== 'admin') {
            return response()->json(['message' => 'Forbidden: only admin can update quantity used'], 403);
        }

        $usage = EventInventoryUsage::firstOrNew(['booking_inventory_id' => $bookingInventoryId]);

        if ($request->has('quantity_used') && $request->input('quantity_used') !== '') {
            $usage->quantity_used = $validated['quantity_used'];
        }

        if ($request->has('quantity_returned') && $request->input('quantity_returned') !== '') {
            $usage->quantity_returned = $validated['quantity_returned'];
        }

        if ($request->has('remarks') && $request->input('remarks') !== '') {
            $usage->remarks = $validated['remarks'];
        }

        $usage->booking_inventory_id = $bookingInventoryId;
        $usage->save();

        AuditLogger::log('Updated', 'Module: Booking Details | Item ID: ' . $bookingInventoryId . ' | Used: ' . ($validated['quantity_used'] ?? 0) . ' | Returned: ' . ($validated['quantity_returned'] ?? 0));

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new InventoryUsageUpdatedNotification($usage, 'returned'));
        }

        return response()->json(['message' => 'Usage saved.', 'usage' => $usage]);
    }

    public function destroy($id)
    {
        $inventory = BookingInventory::find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $inventory->delete();

        AuditLogger::log('Deleted', 'Module: Booking Details | Deleted item ID: ' . $inventory->item_id . ' from Booking ID: ' . $inventory->booking_id);

        return response()->json(['message' => 'Inventory item deleted successfully'], 200);
    }
}