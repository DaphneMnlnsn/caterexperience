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
                    'item_quantity' => $row->item->item_quantity,
                    'item_current_quantity' => $row->item->item_current_quantity,
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
        $inventory = BookingInventory::with(['item', 'usage'])->findOrFail($id);

        $validated = $request->validate([
            'quantity_assigned' => 'required|integer|min:1',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $oldAssigned = $inventory->quantity_assigned;
            $newAssigned = $validated['quantity_assigned'];

            if ($oldAssigned == $newAssigned) {
                return response()->json(['message' => 'No changes detected.'], 200);
            }

            $inventory->update($validated);

            $usage = EventInventoryUsage::firstOrNew(['booking_inventory_id' => $inventory->booking_inventory_id]);
            $item = $inventory->item;
            $diff = $newAssigned - $oldAssigned;

            if ($usage->quantity_used === null || $usage->quantity_used == $oldAssigned) {
                $usage->quantity_used = $newAssigned;
                $usage->save();

                AuditLogger::log('Updated',
                    "Module: Booking Details | Auto-synced usage for item '{$item->item_name}' ".
                    "({$oldAssigned} to {$newAssigned}) for Booking ID: {$inventory->booking_id}"
                );
            }

            if ($item && $diff !== 0) {
                $item->item_current_quantity -= $diff;
                $item->save();

                $action = $diff > 0 ? 'Used' : 'Restored';
                AuditLogger::log('Updated',
                    "Module: Inventory | {$action} " . abs($diff) . " of '{$item->item_name}' ".
                    "for Booking ID: {$inventory->booking_id}"
                );
            }

            DB::commit();

            AuditLogger::log('Updated',
                "Module: Booking Details | Updated item '{$item->item_name}' ".
                "(New Assigned: {$newAssigned}) for Booking ID: {$inventory->booking_id}"
            );

            return response()->json([
                'message' => 'Inventory item and usage updated successfully',
                'inventory' => $inventory->load('item'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function updateUsage(Request $request, $bookingInventoryId)
    {
        $validated = $request->validate([
            'quantity_used' => 'nullable|numeric|min:0',
            'quantity_returned' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $usage = EventInventoryUsage::firstOrNew(['booking_inventory_id' => $bookingInventoryId]);
            $bookingInventory = BookingInventory::with('item')->find($bookingInventoryId);

            if (!$bookingInventory || !$bookingInventory->item) {
                return response()->json(['error' => 'Booking or item not found'], 404);
            }

            $item = $bookingInventory->item;

            $oldUsed = $usage->quantity_used ?? 0;
            $oldReturned = $usage->quantity_returned ?? 0;

            $newUsed = $request->input('quantity_used', $oldUsed);
            $newReturned = $request->input('quantity_returned', $oldReturned);

            $usage->fill([
                'quantity_used' => $newUsed,
                'quantity_returned' => $newReturned,
                'remarks' => $validated['remarks'] ?? $usage->remarks,
            ])->save();

            $usedDiff = $newUsed - $oldUsed;
            $returnedDiff = $newReturned - $oldReturned;

            if ($usedDiff != 0) {
                $item->item_current_quantity -= $usedDiff;
                $item->save();

                if ($usedDiff > 0) {
                    AuditLogger::log('Updated', "Module: Inventory | Used {$usedDiff} more of '{$item->item_name}' for Booking ID: {$bookingInventory->booking_id}");
                } else {
                    AuditLogger::log('Updated', "Module: Inventory | Restored " . abs($usedDiff) . " of '{$item->item_name}' for Booking ID: {$bookingInventory->booking_id}");
                }
            }

            if ($returnedDiff > 0) {
                $item->item_current_quantity += $returnedDiff;
                $item->save();

                AuditLogger::log('Updated', "Module: Inventory | Returned {$returnedDiff} of '{$item->item_name}' for Booking ID: {$bookingInventory->booking_id}");
            }

            DB::commit();

            return response()->json([
                'message' => 'Usage updated successfully.',
                'usage' => $usage
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
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