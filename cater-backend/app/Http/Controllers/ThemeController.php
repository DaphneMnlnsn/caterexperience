<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
use App\Models\Theme;
use App\Models\ThemeImage;

class ThemeController extends Controller
{
    public function index()
    {
        $themes = Theme::with('images')->get();
        return response()->json(['themes' => $themes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'theme_name' => 'required|string|max:255',
            'theme_description' => 'nullable|string',
            'theme_status' => 'required|string',
            'theme_images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $theme = Theme::create([
            'theme_name' => $validated['theme_name'],
            'theme_description' => $validated['theme_description'] ?? null,
            'theme_status' => $validated['theme_status'],
        ]);

        if ($request->hasFile('theme_images')) {
            foreach ($request->file('theme_images') as $file) {
                $filename = uniqid('', true) . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/theme_images'), $filename);

                ThemeImage::create([
                    'theme_id' => $theme->theme_id,
                    'image_url' => 'uploads/theme_images/' . $filename,
                ]);
            }
        }

        AuditLogger::log('Created', "Module: Theme | Theme: {$theme->theme_name}, ID: {$theme->theme_id}");

        return response()->json(['message' => 'Theme created successfully', 'theme' => $theme->load('images')], 201);
    }

    public function update(Request $request, $id)
    {
        $theme = Theme::findOrFail($id);

        $validated = $request->validate([
            'theme_name' => 'required|string|max:255',
            'theme_description' => 'nullable|string',
            'theme_status' => 'required|string',
            'theme_images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $theme->update([
            'theme_name' => $validated['theme_name'],
            'theme_description' => $validated['theme_description'] ?? null,
            'theme_status' => $validated['theme_status'],
        ]);

        if ($request->hasFile('theme_images')) {
            foreach ($request->file('theme_images') as $file) {
                $filename = uniqid('', true) . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/theme_images'), $filename);

                ThemeImage::create([
                    'theme_id' => $theme->theme_id,
                    'image_url' => 'uploads/theme_images/' . $filename,
                ]);
            }
        }

        AuditLogger::log('Updated', "Module: Theme | Theme: {$theme->theme_name}, ID: {$theme->theme_id}");

        return response()->json(['message' => 'Theme updated successfully', 'theme' => $theme->load('images')]);
    }

    public function destroy($id)
    {
        $theme = Theme::with('images')->find($id);

        if (!$theme) {
            return response()->json(['message' => 'Theme not found'], 404);
        }

        foreach ($theme->images as $image) {
            if (file_exists(public_path($image->image_url))) {
                unlink(public_path($image->image_url));
            }
        }

        $themeName = $theme->theme_name;
        $themeId = $theme->theme_id;
        $theme->delete();

        AuditLogger::log('Deleted', "Module: Theme | Deleted theme: {$themeName}, ID: {$themeId}");

        return response()->json(['message' => 'Theme deleted successfully'], 200);
    }
}