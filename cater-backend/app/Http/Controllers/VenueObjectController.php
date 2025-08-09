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
            VenueObject::where('archived', false)->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'object_name'      => 'required|string|max:255',
            'object_type'      => 'required|string|max:100',
            'object_props'     => 'required|json',
            'default_x'        => 'nullable|numeric',
            'default_y'        => 'nullable|numeric',
            'default_rotation' => 'nullable|numeric',
            'default_scale'    => 'nullable|numeric|min:0',
            'z_index'          => 'nullable|integer|min:0',
        ]);

        $data = array_merge($validated, ['archived' => false]);

        $object = VenueObject::create($data);

        AuditLogger::log(
            'Created',
            "Module: Venue Object | Created object: {$object->object_name} (type: {$object->object_type}), ID: {$object->object_id}"
        );

        return response()->json($object, 201);
    }

    public function update(Request $request, $id)
    {
        $object = VenueObject::findOrFail($id);

        $validated = $request->validate([
            'object_name'      => 'sometimes|required|string|max:255',
            'object_type'      => 'sometimes|required|string|max:100',
            'object_props'     => 'sometimes|required|json',
            'default_x'        => 'nullable|numeric',
            'default_y'        => 'nullable|numeric',
            'default_rotation' => 'nullable|numeric',
            'default_scale'    => 'nullable|numeric|min:0',
            'z_index'          => 'nullable|integer|min:0',
            'archived'         => 'nullable|boolean',
        ]);

        $object->update($validated);

        AuditLogger::log(
            'Updated',
            "Module: Venue Object | Updated object: {$object->object_name} (type: {$object->object_type}), ID: {$object->object_id}"
        );

        return response()->json($object);
    }

    public function archive($id)
    {
        $object = VenueObject::findOrFail($id);
        $object->update(['archived' => true]);

        AuditLogger::log(
            'Archived',
            "Module: Venue Object | Archived object: {$object->object_name}, ID: {$object->object_id}"
        );

        return response()->json(['message' => 'Object archived.']);
    }

    public function destroy($id)
    {
        $object = VenueObject::find($id);
        if (!$object) {
            return response()->json(['message' => 'Object not found'], 404);
        }

        $name = $object->object_name;
        $type = $object->object_type;
        $id   = $object->object_id;

        $object->delete();

        AuditLogger::log(
            'Deleted',
            "Module: Venue Object | Deleted object: {$name} (type: {$type}), ID: {$id}"
        );

        return response()->json(['message' => 'Object deleted successfully'], 200);
    }
}
