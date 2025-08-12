<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\TemplateSetup;
use App\Models\VenueObjectPlacement;
use App\Models\VenueSetup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VenueSetupController extends Controller
{
    public function index(Request $request)
    {
        $setups = VenueSetup::all();
        return response()->json(['setups' => $setups]);
    }
    
    public function indexSelected($bookingId)
    {
        $setup = VenueSetup::where('booking_id', $bookingId)->first();
        return response()->json($setup);
    }

    public function indexSetup($setupId)
    {
        $setup = VenueSetup::where('setup_id', $setupId)->first();
        return response()->json($setup);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id'    => 'required|exists:event_bookings,booking_id',
            'layout_name'   => 'required|string',
            'layout_theme'  => 'nullable|string',
            'layout_type'   => 'nullable|string',
            'notes'         => 'nullable|string',
            'status'        => 'nullable|string',
            'placements'    => 'array',
            'placements.*.object_id'   => 'required|exists:venue_objects,object_id',
            'placements.*.x_position'  => 'required|numeric',
            'placements.*.y_position'  => 'required|numeric',
            'placements.*.rotation'    => 'nullable|numeric',
            'placements.*.status'      => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $setup = VenueSetup::create([
                'booking_id'   => $validated['booking_id'],
                'layout_name'  => $validated['layout_name'],
                'layout_theme' => $validated['layout_theme'] ?? null,
                'layout_type'  => $validated['layout_type'] ?? null,
                'notes'        => $validated['notes'] ?? null,
                'status'       => $validated['status'] ?? 'Pending',
            ]);

            if (!empty($validated['placements'])) {
                foreach ($validated['placements'] as $placementData) {
                    $placementData['setup_id'] = $setup->setup_id;
                    VenueObjectPlacement::create($placementData);
                }
            }

            DB::commit();

            AuditLogger::log('Created', "Module: Venue Setup | Created setup: {$setup->layout_name}, ID: {$setup->setup_id}");

            return response()->json([
                'message' => 'Venue setup created successfully.',
                'setup'   => $setup->load('placements.object'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Failed to create venue setup.'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'layout_name'   => 'required|string',
            'layout_theme'  => 'nullable|string',
            'layout_type'   => 'nullable|string',
            'notes'         => 'nullable|string',
            'status'        => 'nullable|string',
            'placements'    => 'array',
            'placements.*.object_id'   => 'required|exists:venue_objects,object_id',
            'placements.*.x_position'  => 'required|numeric',
            'placements.*.y_position'  => 'required|numeric',
            'placements.*.rotation'    => 'nullable|numeric',
            'placements.*.status'      => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $setup = VenueSetup::findOrFail($id);

            $setup->update([
                'layout_name'  => $validated['layout_name'],
                'layout_theme' => $validated['layout_theme'] ?? null,
                'layout_type'  => $validated['layout_type'] ?? null,
                'notes'        => $validated['notes'] ?? null,
                'status'       => $validated['status'] ?? $setup->status,
            ]);

            VenueObjectPlacement::where('setup_id', $setup->setup_id)->delete();

            if (!empty($validated['placements'])) {
                foreach ($validated['placements'] as $placementData) {
                    $placementData['setup_id'] = $setup->setup_id;
                    VenueObjectPlacement::create($placementData);
                }
            }

            DB::commit();

            AuditLogger::log('Updated', "Module: Venue Setup | Updated setup: {$setup->layout_name}, ID: {$setup->setup_id}");

            return response()->json([
                'message' => 'Venue setup updated successfully.',
                'setup'   => $setup->load('placements.object'),
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Failed to update venue setup.'], 500);
        }
    }
    public function applyTemplate(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:event_bookings,booking_id',
            'template_id' => 'required|exists:template_setups,template_id',
        ]);

        DB::beginTransaction();
        try {
            $template = TemplateSetup::with('placements')->findOrFail($validated['template_id']);

            $setup = VenueSetup::create([
                'booking_id' => $validated['booking_id'],
                'layout_name' => $template->layout_name,
                'layout_theme' => $template->layout_theme,
                'layout_type' => $template->layout_type,
                'notes' => '[Generated from template] ' . $template->notes,
                'status' => 'Pending',
            ]);

            foreach ($template->placements as $placement) {
                VenueObjectPlacement::create([
                    'setup_id' => $setup->setup_id,
                    'object_id' => $placement->object_id,
                    'x_position' => $placement->x_position,
                    'y_position' => $placement->y_position,
                    'rotation' => $placement->rotation,
                    'status' => $placement->status,
                ]);
            }

            DB::commit();

            AuditLogger::log('Created', "Module: Venue Setup | Applied template: {$template->layout_name} to booking ID: {$validated['booking_id']}, New Setup ID: {$setup->setup_id}");

            return response()->json([
                'message' => 'Template applied successfully.',
                'setup' => $setup->load('placements.object'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to apply template.'], 500);
        }
    }
}
