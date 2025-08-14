<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\TemplateSetup;
use App\Models\TemplateObjectPlacement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
            'template_name'   => 'required|string',
            'layout_type'   => 'nullable|string',
            'notes'         => 'nullable|string',
            'placements'    => 'required|array|min:1',
            'placements.*.object_id'     => 'required|exists:venue_objects,object_id',
            'placements.*.x_position'    => 'required|numeric',
            'placements.*.y_position'    => 'required|numeric',
            'placements.*.rotation'      => 'nullable|numeric',
            'placements.*.status'        => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $exists = TemplateSetup::where('template_name', $validated['template_name'])
                ->where('layout_type', $validated['layout_type'] ?? null)
                ->exists();

            if ($exists) {
                return response()->json(['error' => 'A template with that name and type already exists.'], 409);
            }

            $template = TemplateSetup::create([
                'template_name' => $validated['template_name'],
                'layout_type' => $validated['layout_type'] ?? null,
                'notes'       => $validated['notes'] ?? null,
            ]);

            $now = now();
            $rows = array_map(function ($p) use ($template, $now) {
                $op = null;
                if (isset($p['object_props'])) {
                    if (is_array($p['object_props']) || is_object($p['object_props'])) {
                        $op = json_encode($p['object_props']);
                    } elseif (is_string($p['object_props'])) {
                        $decoded = json_decode($p['object_props'], true);
                        $op = ($decoded === null && json_last_error() !== JSON_ERROR_NONE) ? $p['object_props'] : json_encode($decoded);
                    }
                }

                return [
                    'template_id'  => $template->template_id,
                    'object_id'    => $p['object_id'],
                    'x_position'   => $p['x_position'],
                    'y_position'   => $p['y_position'],
                    'rotation'     => $p['rotation'] ?? 0,
                    'status'       => $p['status'] ?? null,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                ];
            }, $validated['placements']);

            TemplateObjectPlacement::insert($rows);

            DB::commit();

            AuditLogger::log('Created', "Module: Template Setup | Created layout: {$template->layout_name}, ID: {$template->template_id}");

            $template->load(['placements.object']);

            return response()->json([
                'message'  => 'Template saved successfully.',
                'template' => $template,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save template.', 'details' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $template = TemplateSetup::with('placements.object')->findOrFail($id);
        return response()->json(['template' => $template]);
    }

    public function update(Request $request, $templateId)
    {
        $validated = $request->validate([
            'template_name'   => 'required|string',
            'layout_type'     => 'nullable|string',
            'notes'           => 'nullable|string',
            'placements'      => 'required|array|min:1',
            'placements.*.object_id'     => 'required|exists:venue_objects,object_id',
            'placements.*.x_position'    => 'required|numeric',
            'placements.*.y_position'    => 'required|numeric',
            'placements.*.rotation'      => 'nullable|numeric',
            'placements.*.status'        => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $template = TemplateSetup::findOrFail($templateId);

            $exists = TemplateSetup::where('template_name', $validated['template_name'])
                ->where('layout_type', $validated['layout_type'] ?? null)
                ->where('template_id', '!=', $templateId)
                ->exists();

            if ($exists) {
                return response()->json(['error' => 'A template with that name and type already exists.'], 409);
            }

            $template->update([
                'template_name' => $validated['template_name'],
                'layout_type'   => $validated['layout_type'] ?? null,
                'notes'         => $validated['notes'] ?? null,
            ]);

            TemplateObjectPlacement::where('template_id', $templateId)->delete();

            $now = now();
            $rows = array_map(function ($p) use ($templateId, $now) {
                $op = null;
                if (isset($p['object_props'])) {
                    if (is_array($p['object_props']) || is_object($p['object_props'])) {
                        $op = json_encode($p['object_props']);
                    } elseif (is_string($p['object_props'])) {
                        $decoded = json_decode($p['object_props'], true);
                        $op = ($decoded === null && json_last_error() !== JSON_ERROR_NONE)
                            ? $p['object_props']
                            : json_encode($decoded);
                    }
                }

                return [
                    'template_id'  => $templateId,
                    'object_id'    => $p['object_id'],
                    'x_position'   => $p['x_position'],
                    'y_position'   => $p['y_position'],
                    'rotation'     => $p['rotation'] ?? 0,
                    'status'       => $p['status'] ?? null,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                ];
            }, $validated['placements']);

            TemplateObjectPlacement::insert($rows);

            DB::commit();

            AuditLogger::log('Updated', "Module: Template Setup | Updated layout: {$template->template_name}, ID: {$template->template_id}");

            $template->load(['placements.object']);

            return response()->json([
                'message'  => 'Template updated successfully.',
                'template' => $template,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update template.', 'details' => $e->getMessage()], 500);
        }
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