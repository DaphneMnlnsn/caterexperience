<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    public function index()
    {
        $items = Inventory::with('updatedBy')->get();

        AuditLogger::log('Viewed', 'Module: Inventory | Viewed inventory list');

        return response()->json($items);
    }

    public function indexSelected($id)
    {
        $item = Inventory::with('updatedBy')->findOrFail($id);

        return response()->json($item);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string',
            'item_quantity' => 'required|integer|min:0',
            'item_unit' => 'required|string',
            'item_price' => 'required|numeric|min:0',
            'item_type' => 'required|string',
            'item_status' => 'nullable|string',
            'item_description' => 'nullable|string',
        ]);

        $validated['item_current_quantity'] = $validated['item_quantity'];
        $validated['last_updated_on'] = Carbon::now();
        $validated['last_updated_by'] = Auth::id();
        
        $existingItem = Inventory::whereRaw('LOWER(item_name) = ?', [strtolower($validated['item_name'])])
        ->first();

        if ($existingItem) {
            return response()->json([
                'message' => 'Item already exists.',
            ], 409);
        }

        $item = Inventory::create($validated);

        AuditLogger::log('Created', 'Module: Inventory | Created item: ' . $validated['item_name']);

        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);

        $validated = $request->validate([
            'item_name' => 'sometimes|string',
            'item_quantity' => 'sometimes|integer|min:0',
            'item_unit' => 'sometimes|string',
            'item_price' => 'sometimes|numeric|min:0',
            'item_type' => 'sometimes|string',
            'item_status' => 'nullable|string',
            'item_description' => 'nullable|string',
            'item_current_quantity' => 'sometimes|integer|min:0',
        ]);

        $validated['last_updated_on'] = Carbon::now();
        $validated['last_updated_by'] = Auth::id();

        $item->update($validated);

        AuditLogger::log('Updated', 'Module: Inventory | Updated item ID: ' . $id);

        return response()->json($item);
    }

    public function archive($id)
    {
        $item = Inventory::findOrFail($id);
        $item->item_status = 'archived';
        $item->save();

        AuditLogger::log('Archived', 'Module: Inventory | Archived item: ' . $item->item_name);

        return response()->json(['message' => 'Item archived successfully.']);
    }

    public function restore($id)
    {
        $item = Inventory::findOrFail($id);
        $item->item_status = 'available';
        $item->save();

        AuditLogger::log('Restored', 'Module: Inventory | Restored item: ' . $item->item_name);

        return response()->json(['message' => 'Item restored successfully.']);
    }

    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);

        $itemName = $item->item_name;
        $itemId = $item->item_id;
        $item->delete();

        AuditLogger::log('Deleted', "Module: Inventory | Deleted item: {$itemName}, ID: {$itemId}");

        return response()->json(['message' => 'Item deleted successfully.']);
    }
}