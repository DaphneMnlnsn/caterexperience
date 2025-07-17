<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Package;
use App\Models\PackagePrice;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::with('priceTiers')->get();
        return response()->json(['packages' => $packages]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_name' => 'required|string|max:255',
            'package_price' => 'nullable|numeric',
            'package_description' => 'nullable|string',
            'package_type' => 'required|string',
            'package_status' => 'required|string',
            'price_tiers' => 'array',
            'price_tiers.*.price_label' => 'required|string',
            'price_tiers.*.price_amount' => 'required|numeric',
            'price_tiers.*.pax' => 'required|integer',
            'price_tiers.*.status' => 'required|string'
        ]);

        $package = Package::create($validated);

        if (!empty($request->price_tiers)) {
            foreach ($request->price_tiers as $tier) {
                $tier['package_id'] = $package->package_id;
                PackagePrice::create($tier);
            }
        }

        return response()->json(['message' => 'Package created successfully', 'package' => $package->load('priceTiers')], 201);
    }
    public function update(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'package_name' => 'required|string|max:255',
            'package_price' => 'nullable|numeric',
            'package_description' => 'nullable|string',
            'package_type' => 'required|string',
            'package_status' => 'required|string',
            'price_tiers' => 'array',
            'price_tiers.*.price_label' => 'required|string',
            'price_tiers.*.price_amount' => 'required|numeric',
            'price_tiers.*.pax' => 'required|integer',
            'price_tiers.*.status' => 'required|string',
            'price_tiers.*.package_price_id' => 'nullable|integer|exists:package_prices,package_price_id'
        ]);

        $package->update([
            'package_name' => $validated['package_name'],
            'package_price' => $validated['package_price'],
            'package_description' => $validated['package_description'],
            'package_type' => $validated['package_type'],
            'package_status' => $validated['package_status'],
        ]);

        $existingIds = [];
        foreach ($request->price_tiers as $tier) {
            if (!empty($tier['package_price_id'])) {
                $existing = PackagePrice::find($tier['package_price_id']);
                if ($existing && $existing->package_id == $package->package_id) {
                    $existing->update([
                        'price_label' => $tier['price_label'],
                        'price_amount' => $tier['price_amount'],
                        'pax' => $tier['pax'],
                        'status' => $tier['status'],
                    ]);
                    $existingIds[] = $existing->package_price_id;
                }
            } else {
                $new = PackagePrice::create([
                    'package_id' => $package->package_id,
                    'price_label' => $tier['price_label'],
                    'price_amount' => $tier['price_amount'],
                    'pax' => $tier['pax'],
                    'status' => $tier['status'],
                ]);
                $existingIds[] = $new->package_price_id;
            }
        }

        PackagePrice::where('package_id', $package->package_id)
            ->whereNotIn('package_price_id', $existingIds)
            ->delete();

        return response()->json([
            'message' => 'Package updated successfully',
            'package' => $package->load('priceTiers')
        ]);
    }

    public function destroy($id)
    {
        $package = Package::find($id);

        if (!$package) {
            return response()->json(['message' => 'Package not found'], 404);
        }

        $package->delete();

        return response()->json(['message' => 'Package deleted successfully'], 200);
    }
}
