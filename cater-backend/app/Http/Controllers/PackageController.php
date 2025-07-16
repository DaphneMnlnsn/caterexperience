<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Package;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::all();
        return response()->json(['packages' => $packages]);
    }
    /*public function store(Request $request)
    {
        $validated = $request->validate([
            'food_name' => 'required|string|max:255',
            'food_type' => 'required|string|max:100',
            'food_description' => 'nullable|string',
            'food_status' => 'required|string',
            'food_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('food_image')) {
            $imagePath = $request->file('food_image')->store('food_images', 'public');
        }

        $food = Food::create([
            'food_name' => $validated['food_name'],
            'food_type' => $validated['food_type'],
            'food_description' => $validated['food_description'] ?? null,
            'food_status' => $validated['food_status'],
            'food_image_url' => $imagePath,
        ]);

        return response()->json(['message' => 'Food created successfully', 'food' => $food], 201);
    }
    public function update(Request $request, $id)
    {
        $food = Food::findOrFail($id);

        $validated = $request->validate([
            'food_name' => 'required|string|max:255',
            'food_type' => 'required|string|max:100',
            'food_description' => 'nullable|string',
            'food_status' => 'required|string',
            'food_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('food_image')) {
            if ($food->food_image_url && Storage::disk('public')->exists($food->food_image_url)) {
                Storage::disk('public')->delete($food->food_image_url);
            }
            $imagePath = $request->file('food_image')->store('food_images', 'public');
            $food->food_image_url = $imagePath;
        }

        $food->update([
            'food_name' => $validated['food_name'],
            'food_type' => $validated['food_type'],
            'food_description' => $validated['food_description'] ?? null,
            'food_status' => $validated['food_status'],
        ]);

        return response()->json(['message' => 'Food updated successfully', 'food' => $food]);
    }
    public function destroy($id)
    {
        $food = Food::find($id);

        if (!$food) {
            return response()->json(['message' => 'Food not found'], 404);
        }

        if ($food->food_image_url && Storage::disk('public')->exists($food->food_image_url)) {
            Storage::disk('public')->delete($food->food_image_url);
        }

        $food->delete();

        return response()->json(['message' => 'Food deleted successfully'], 200);
    }*/
}
