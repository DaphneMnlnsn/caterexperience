<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\TemplateSetup;
use App\Models\TemplateObjectPlacement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TemplateSetupController extends Controller
{
    public function index()
    {
        $templates = TemplateSetup::with('placements.object')->get();
        return response()->json(['templates' => $templates]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'layout_name'   => 'required|string',
            'layout_theme'  => 'nullable|string',
            'layout_type'   => 'nullable|string',
            'notes'         => 'nullable|string',
            'placements'    => 'required|array',
            'placements.*.object_id'   => 'required|exists:venue_objects,object_id',
            'placements.*.x_position'  => 'required|numeric',
            'placements.*.y_position'  => 'required|numeric',
            'placements.*.rotation'    => 'nullable|numeric',
            'placements.*.status'      => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $template = TemplateSetup::create([
                'layout_name'  => $validated['layout_name'],
                'layout_theme' => $validated['layout_theme'] ?? null,
                'layout_type'  => $validated['layout_type'] ?? null,
                'notes'        => $validated['notes'] ?? null,
            ]);

            foreach ($validated['placements'] as $placement) {
                TemplateObjectPlacement::create([
                    'template_id' => $template->template_id,
                    'object_id'   => $placement['object_id'],
                    'x_position'  => $placement['x_position'],
                    'y_position'  => $placement['y_position'],
                    'rotation'    => $placement['rotation'] ?? 0,
                    'status'      => $placement['status'] ?? null,
                ]);
            }

            DB::commit();

            AuditLogger::log('Created', "Module: Template Setup | Created layout: {$template->layout_name}, ID: {$template->template_id}");

            return response()->json([
                'message' => 'Template saved successfully.',
                'template' => $template->load('placements.object'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save template.'], 500);
        }
    }

    public function show($id)
    {
        $template = TemplateSetup::with('placements.object')->findOrFail($id);
        return response()->json(['template' => $template]);
    }

    public function destroy($id)
    {
        $template = TemplateSetup::findOrFail($id);
        
        $templateName = $template->layout_name;
        $templateId = $template->template_id;
        $template->delete();

        AuditLogger::log('Deleted', "Module: Template Setup | Deleted layout: {$templateName}, ID: {$templateId}");

        return response()->json(['message' => 'Template deleted.']);
    }
}