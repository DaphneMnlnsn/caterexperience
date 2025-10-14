<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use App\Models\Addon;
use App\Models\AddonPrice;

class AddonController extends Controller
{
    public function index()
    {
        AuditLogger::log('Viewed', 'Module: Addon | Viewed addons list');

        $addons = Addon::with('prices')->get();
        return response()->json(['addons' => $addons]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'addon_name' => 'required|string|max:255',
            'addon_type' => 'required|string',
            'addon_description' => 'nullable|string',
            'addon_price' => 'nullable|numeric',
            'addon_status' => 'required|string',
            'prices' => 'required|array',
            'prices.*.description' => 'required|string',
            'prices.*.price' => 'required|numeric',
        ]);

        $existingAddon = Addon::whereRaw('LOWER(addon_name) = ?', [strtolower($validated['addon_name'])])
        ->first();

        if ($existingAddon) {
            return response()->json([
                'message' => 'Addon already exists.',
            ], 409);
        }

        $addon = Addon::create($validated);

        if (!empty($request->prices)) {
            foreach ($request->prices as $price) {
                $price['addon_id'] = $addon->addon_id;
                AddonPrice::create($price);
            }
        }

        AuditLogger::log('Created', "Module: Addon | Addon: {$addon->addon_name}, ID: {$addon->addon_id}");
        
        return response()->json(['message' => 'Addon created successfully!', 'addon' => $addon->load('prices')]);
    }
    public function update(Request $request, $id)
    {
        $addon = Addon::findOrFail($id);

        $validated = $request->validate([
            'addon_name' => 'required|string|max:255',
            'addon_type' => 'required|string|max:100',
            'addon_description' => 'nullable|string',
            'addon_status' => 'required|string',
            'prices' => 'required|array',
            'prices.*.addon_price_id' => 'nullable|integer',
            'prices.*.description' => 'required|string',
            'prices.*.price' => 'required|numeric|min:0',
        ]);

        $addon->update([
            'addon_name' => $validated['addon_name'],
            'addon_type' => $validated['addon_type'],
            'addon_description' => $validated['addon_description'],
            'addon_status' => $validated['addon_status'],
        ]);

        $existingIds = [];
        foreach ($request->prices as $price) {
            if (!empty($price['addon_price_id'])) {
                $existing = AddonPrice::find($price['addon_price_id']);
                if ($existing && $existing->addon_id == $addon->addon_id) {
                    $existing->update([
                        'description' => $price['description'],
                        'price' => $price['price'],
                    ]);
                    $existingIds[] = $existing->addon_price_id;
                }
            } else {
                $new = AddonPrice::create([
                    'addon_id' => $addon->addon_id,
                    'description' => $price['description'],
                    'price' => $price['price'],
                ]);
                $existingIds[] = $new->addon_price_id;
            }
        }

        AddonPrice::where('addon_id', $addon->addon_id)
            ->whereNotIn('addon_price_id', $existingIds)
            ->delete();

        AuditLogger::log('Updated', "Module: Addon | Addon: {$addon->addon_name}, ID: {$addon->addon_id}");

        return response()->json([
            'message' => 'Addon updated successfully',
            'addon' => $addon->load('prices')
        ]);
    }
    public function destroy($id)
    {
        $addon = Addon::find($id);

        if (!$addon) {
            return response()->json(['message' => 'Addon not found'], 404);
        }

        $addonName = $addon->addon_name;
        $addonId = $addon->addon_id;
        $addon->delete();

        AuditLogger::log('Deleted', "Module: Addon | Addon: {$addonName}, ID: {$addonId}");

        return response()->json(['message' => 'Addon deleted successfully'], 200);
    }
}
