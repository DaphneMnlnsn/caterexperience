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

        $oldReturned = $usage->quantity_returned ?? 0;

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

        if ($request->has('quantity_returned')) {
            $bookingInventory = BookingInventory::with('item')->find($bookingInventoryId);

            if ($bookingInventory && $bookingInventory->item) {
                $item = $bookingInventory->item;

                $returnedDiff = ($validated['quantity_returned'] ?? 0) - $oldReturned;

                if ($returnedDiff > 0) {
                    $item->item_current_quantity += $returnedDiff;
                    $item->save();

                    AuditLogger::log('Updated', "Module: Inventory | Returned {$returnedDiff} to item '{$item->item_name}' for Booking ID: {$bookingInventory->booking_id}");
                }
            }
        }

        AuditLogger::log('Updated', 'Module: Booking Details | Item ID: ' . $bookingInventoryId . ' | Returned: ' . ($validated['quantity_returned'] ?? 0));

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

    public function syncInventory(Request $request, $bookingId)
    {
        $assigned = $request->assignedInventory;
        DB::beginTransaction();

        try {
            $existingItems = BookingInventory::where('booking_id', $bookingId)->get();
            $namesToKeep = array_keys($assigned);

            foreach ($existingItems as $existing) {
                $inv = Inventory::find($existing->item_id);
                if ($inv && !in_array($inv->item_name, $namesToKeep)) {
                    $existing->delete();
                }
            }
            
            foreach ($assigned as $name => $qty) {
                $inventoryItem = Inventory::where('item_name', $name)->first();
                if (!$inventoryItem) continue;

                $bookingInventory = BookingInventory::updateOrCreate(
                    [
                        'booking_id' => $bookingId,
                        'item_id' => $inventoryItem->item_id,
                    ],
                    [
                        'quantity_assigned' => $qty,
                        'remarks' => 'Auto-assigned from venue layout',
                    ]
                );

                EventInventoryUsage::updateOrCreate(
                    ['booking_inventory_id' => $bookingInventory->booking_inventory_id],
                    [
                        'quantity_used' => $qty,
                        'quantity_returned' => 0,
                        'remarks' => 'Auto-generated from venue layout sync',
                    ]
                );
            }

            DB::commit();

            AuditLogger::log(
                'Synced',
                'Module: Booking Details | Auto-synced inventory for Booking ID: ' . $bookingId
            );

            return response()->json(['message' => 'Inventory and usage synced successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to sync inventory',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

}