<?php

namespace App\Http\Controllers;

use App\Helpers\AuditLogger;
use App\Models\VenueObject;
use Illuminate\Http\Request;

class VenueObjectController extends Controller
{
    public function index()
    {
        return response()->json(
            VenueObject::where('archived', 0)->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'object_name' => 'required|string',
            'object_category' => 'required|string',
            'object_width' => 'required|numeric|min:0',
            'object_height' => 'required|numeric|min:0',
            'image_url' => 'nullable|string',
        ]);

        $object = VenueObject::create($validated);

        AuditLogger::log('Created', "Module: Venue Object | Created object: {$object->object_name}, ID: {$object->object_id}");

        return response()->json($object, 201);
    }

    public function update(Request $request, $id)
    {
        $object = VenueObject::findOrFail($id);
        $object->update($request->only([
            'object_name', 'object_category',
            'object_width', 'object_height',
            'image_url'
        ]));

        AuditLogger::log('Updated', "Module: Venue Object | Updated object: {$object->object_name}, ID: {$object->object_id}");

        return response()->json($object);
    }

    public function archive($id)
    {
        $object = VenueObject::findOrFail($id);

        $object->update(['archived' => 1]);

        AuditLogger::log('Archived', "Module: Venue Object | Archived object: {$object->object_name}, ID: {$object->object_id}");

        return response()->json(['message' => 'Object archived.']);
    }

    public function destroy($id)
    {
        $object = VenueObject::find($id);

        if (!$object) {
            return response()->json(['message' => 'Object not found'], 404);
        }

        $objectName = $object->object_name;
        $objectId = $object->object_id;
        $object->delete();

        AuditLogger::log('Deleted', "Module: Venue Object | Deleted object: {$objectName}, ID: {$objectId}");

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}