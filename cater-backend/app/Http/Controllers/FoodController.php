<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Food;

class FoodController extends Controller
{
    public function index()
    {
        $foods = Food::all();
        return response()->json(['foods' => $foods]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'food_name' => 'required|string|max:255',
            'food_type' => 'required|string|max:100',
            'food_description' => 'nullable|string',
            'food_status' => 'required|string',
        ]);

        $food = Food::create([
            'food_name' => $validated['food_name'],
            'food_type' => $validated['food_type'],
            'food_description' => $validated['food_description'] ?? null,
            'food_status' => $validated['food_status'],
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
        ]);

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

        $food->delete();

        return response()->json(['message' => 'Food deleted successfully'], 200);
    }
}
