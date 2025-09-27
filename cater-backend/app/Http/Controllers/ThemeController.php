<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use Illuminate\Http\Request;
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
            $file = $request->file('theme_image');
            $extension = $file->getClientOriginalExtension();

            $filename = uniqid('', true) . '.' . $extension;

            $file->move(public_path('uploads/theme_images'), $filename);

            $imagePath = 'uploads/theme_images/' . $filename;
        }

        $theme = Theme::create([
            'theme_name' => $validated['theme_name'],
            'theme_description' => $validated['theme_description'] ?? null,
            'theme_status' => $validated['theme_status'],
            'theme_image_url' => $imagePath,
        ]);

        AuditLogger::log('Created', "Module: Theme | Theme: {$theme->theme_name}, ID: {$theme->theme_id}");

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

        $data = [
            'theme_name' => $validated['theme_name'],
            'theme_description' => $validated['theme_description'] ?? null,
            'theme_status' => $validated['theme_status'],
        ];

        if ($request->hasFile('theme_image')) {
            if ($theme->theme_image_url && file_exists(public_path($theme->theme_image_url))) {
                unlink(public_path($theme->theme_image_url));
            }

            $file = $request->file('theme_image');
            $extension = $file->getClientOriginalExtension();

            $filename = uniqid('', true) . '.' . $extension;

            $file->move(public_path('uploads/theme_images'), $filename);

            $data['theme_image_url'] = 'uploads/theme_images/' . $filename;
        }

        $theme->update($data);

        AuditLogger::log('Updated', "Module: Theme | Theme: {$theme->theme_name}, ID: {$theme->theme_id}");

        return response()->json(['message' => 'Theme updated successfully', 'theme' => $theme]);
    }

    public function destroy($id)
    {
        $theme = Theme::find($id);

        if (!$theme) {
            return response()->json(['message' => 'Theme not found'], 404);
        }

        if ($theme->theme_image_url && file_exists(public_path($theme->theme_image_url))) {
            unlink(public_path($theme->theme_image_url));
        }

        $themeName = $theme->theme_name;
        $themeId = $theme->theme_id;
        $theme->delete();

        AuditLogger::log('Deleted', "Module: Theme | Deleted theme: {$themeName}, ID: {$themeId}");

        return response()->json(['message' => 'Theme deleted successfully'], 200);
    }
}