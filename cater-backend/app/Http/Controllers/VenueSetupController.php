<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\TemplateSetup;
use App\Models\VenueObjectPlacement;
use App\Models\VenueSetup;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class VenueSetupController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = VenueSetup::with(['booking.customer', 'booking.theme']);

        if (strtolower($user->role) !== 'admin') {
            $query->whereHas('booking.staffAssignments', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

            if (strtolower($user->role) === 'head waiter') {
                $query->whereIn('status', ['approved', 'submitted']);
            }
        }

        $setups = $query->get();

        return response()->json(['setups' => $setups]);
    }

    public function indexSelected(Request $request, $bookingId)
    {
        $accessToken = $request->bearerToken();
        $token = PersonalAccessToken::findToken($accessToken);
        $auth = $token?->tokenable;

        $query = VenueSetup::with(['booking.customer', 'booking.theme'])
            ->where('booking_id', $bookingId);

        if ($auth instanceof \App\Models\User) {
            if (strtolower($auth->role) !== 'admin') {
                $query->whereHas('booking.staffAssignments', function ($q) use ($auth) {
                    $q->where('user_id', $auth->id);
                });

                if (strtolower($auth->role) === 'waiter') {
                    $query->whereIn('status', ['approved', 'submitted']);
                }
            }
        } elseif ($auth instanceof \App\Models\Customer) {
            $query->whereHas('booking', function ($q) use ($auth) {
                $q->where('customer_id', $auth->customer_id);
            });
        } else {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $setup = $query->first();

        if (!$setup) {
            return response()->json(['message' => 'Unauthorized or not found'], 403);
        }

        return response()->json($setup);
    }

    public function indexSetup(Request $request, $setupId)
    {
        $accessToken = $request->bearerToken();
        $token = PersonalAccessToken::findToken($accessToken);
        $auth = $token?->tokenable;

        $query = VenueSetup::with(['placements.object', 'booking.staffAssignments'])
            ->where('setup_id', $setupId);

        if ($auth instanceof \App\Models\User) {
            if (strtolower($auth->role) !== 'admin') {
                $query->whereHas('booking.staffAssignments', function ($q) use ($auth) {
                    $q->where('user_id', $auth->id);
                });

                if (strtolower($auth->role) === 'waiter') {
                    $query->whereIn('status', ['approved', 'submitted']);
                }
            }
        } elseif ($auth instanceof \App\Models\Customer) {
            $query->whereHas('booking', function ($q) use ($auth) {
                $q->where('customer_id', $auth->customer_id);
            });
        } else {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $setup = $query->first();

        if (!$setup) {
            return response()->json(['message' => 'Unauthorized or not found'], 403);
        }

        return response()->json($setup);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id'    => 'required|exists:event_bookings,booking_id',
            'layout_name'   => 'required|string',
            'layout_type'   => 'nullable|string',
            'notes'         => 'nullable|string',
            'status'        => 'nullable|string',
            'placements'    => 'array',
            'placements.*.object_id'   => 'required|exists:venue_objects,object_id',
            'placements.*.x_position'  => 'required|numeric',
            'placements.*.y_position'  => 'required|numeric',
            'placements.*.rotation'    => 'nullable|numeric',
            'placements.*.object_props' => 'nullable',
            'placements.*.status'      => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $setup = VenueSetup::create([
                'booking_id'   => $validated['booking_id'],
                'layout_name'  => $validated['layout_name'],
                'layout_type'  => $validated['layout_type'] ?? null,
                'notes'        => $validated['notes'] ?? null,
                'status'       => $validated['status'] ?? 'Pending',
            ]);

            if (!empty($validated['placements'])) {
                foreach ($validated['placements'] as $placementData) {
                    $placementData['setup_id'] = $setup->setup_id;
                    if (isset($placementData['object_props']) && is_string($placementData['object_props'])) {
                        $decoded = json_decode($placementData['object_props'], true);
                        $placementData['object_props'] = $decoded !== null ? $decoded : $placementData['object_props'];
                    }
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
            'placements'                    => 'array',
            'placements.*.placement_id'     => 'sometimes|nullable|integer',
            'placements.*.object_id'        => 'required|exists:venue_objects,object_id',
            'placements.*.x_position'       => 'required|numeric',
            'placements.*.y_position'       => 'required|numeric',
            'placements.*.rotation'         => 'nullable|numeric',
            'placements.*.object_props' => 'nullable',
            'placements.*.status'           => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $setup = VenueSetup::where('setup_id', $id)->lockForUpdate()->firstOrFail();

            $existingPlacements = $setup->placements()->get();
            $existingIds = $existingPlacements->pluck('placement_id')->toArray();

            $processedIds = [];

            $placements = $validated['placements'] ?? [];

            foreach ($placements as $p) {
                $object_props = null;
                if (isset($p['object_props'])) {
                    if (is_string($p['object_props'])) {
                        $decoded = json_decode($p['object_props'], true);
                        $object_props = $decoded !== null ? $decoded : $p['object_props'];
                    } else {
                        $object_props = $p['object_props'];
                    }
                }

                $data = [
                    'setup_id'    => $setup-> setup_id,
                    'object_id'   => $p['object_id'],
                    'x_position'  => $p['x_position'],
                    'y_position'  => $p['y_position'],
                    'rotation'    => $p['rotation'] ?? 0,
                    'object_props' => $object_props,
                    'status'      => $p['status'] ?? null,
                ];

                if (!empty($p['placement_id'])) {
                    $placement = VenueObjectPlacement::where('placement_id', $p['placement_id'])
                        ->where('setup_id', $setup->setup_id)
                        ->first();

                    if ($placement) {
                        $placement->update($data);
                        $processedIds[] = $placement->placement_id;
                    } else {
                        $new = VenueObjectPlacement::create(array_merge($data, ['setup_id' => $setup->setup_id]));
                        $processedIds[] = $new->placement_id;
                    }
                } else {
                    $new = VenueObjectPlacement::create(array_merge($data, ['setup_id' => $setup->setup_id]));
                    $processedIds[] = $new->placement_id;
                }
            }

            $toDelete = array_diff($existingIds, $processedIds);
            if (!empty($toDelete)) {
                VenueObjectPlacement::whereIn('placement_id', $toDelete)
                    ->where('setup_id', $setup->setup_id)
                    ->delete();
            }

            DB::commit();

            AuditLogger::log('Updated', "Module: Venue Setup | Updated setup: {$setup->layout_name}");

            if ($request->user()->role !== 'admin') {
                $booking = $setup->booking;
                if ($booking) {
                    NotificationService::sendVenueUpdated($booking);
                }
            }

            return response()->json([
                'message' => 'Venue setup updated successfully.',
                'setup'   => $setup->load('placements.object'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update venue setup.', 'details' => $e->getMessage()], 500);
        }
    }

    public function submit(Request $request, $id)
    {
        $setup = VenueSetup::find($id);

        if (!$setup) {
            return response()->json(['message' => 'Setup not found'], 404);
        }

        $setup->status = 'submitted';
        $setup->save();

        $booking = $setup->booking;
        NotificationService::sendVenueSetupSubmitted($booking);

        AuditLogger::log('Updated', "Module: Venue Setup | Submitted Setup {$setup->layout_name}");

        return response()->json(['message' => 'Setup submitted to client']);
    }

    public function approve(Request $request, $id)
    {
        $setup = VenueSetup::find($id);

        if (!$setup) {
            return response()->json(['message' => 'Setup not found'], 404);
        }

        $setup->status = 'approved';
        $setup->save();

        $booking = $setup->booking;

        NotificationService::sendVenueSetupApproved($booking);

        AuditLogger::log('Updated', "Module: Venue Setup | Approved Setup {$setup->layout_name}");

        return response()->json(['message' => 'Setup approved']);
    }
}
