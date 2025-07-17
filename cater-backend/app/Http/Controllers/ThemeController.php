<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Theme;

class ThemeController extends Controller
{
    public function index()
    {
        $themes = Theme::all();
        return response()->json(['themes' => $themes]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'theme_name' => 'required|string|max:255',
            'theme_description' => 'nullable|string',
            'theme_status' => 'required|string',
            'theme_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('theme_image')) {
            $imagePath = $request->file('theme_image')->store('theme_images', 'public');
        }

        $theme = Theme::create([
            'theme_name' => $validated['theme_name'],
            'theme_description' => $validated['theme_description'] ?? null,
            'theme_status' => $validated['theme_status'],
            'theme_image_url' => $imagePath,
        ]);

        return response()->json(['message' => 'Theme created successfully', 'theme' => $theme], 201);
    }
    public function update(Request $request, $id)
    {
        $theme = Theme::findOrFail($id);

        $validated = $request->validate([
            'theme_name' => 'required|string|max:255',
            'theme_description' => 'nullable|string',
            'theme_status' => 'required|string',
            'theme_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('theme_image')) {
            if ($theme->theme_image_url && Storage::disk('public')->exists($theme->theme_image_url)) {
                Storage::disk('public')->delete($theme->theme_image_url);
            }
            $imagePath = $request->file('theme_image')->store('theme_images', 'public');
            $theme->theme_image_url = $imagePath;
        }

        $theme->update([
            'theme_name' => $validated['theme_name'],
            'theme_description' => $validated['theme_description'] ?? null,
            'theme_status' => $validated['theme_status'],
        ]);

        return response()->json(['message' => 'Theme updated successfully', 'theme' => $theme]);
    }
    public function destroy($id)
    {
        $theme = Theme::find($id);

        if (!$theme) {
            return response()->json(['message' => 'Theme not found'], 404);
        }

        if ($theme->theme_image_url && Storage::disk('public')->exists($theme->theme_image_url)) {
            Storage::disk('public')->delete($theme->theme_image_url);
        }

        $theme->delete();

        return response()->json(['message' => 'Theme deleted successfully'], 200);
    }
}
