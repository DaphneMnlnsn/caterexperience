<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VenueObjectPlacement extends Model
{
    protected $table = 'venue_object_placement';
    protected $primaryKey = 'placement_id';

    protected $fillable = [
        'setup_id',
        'object_id',
        'x_position',
        'y_position',
        'rotation',
        'object_props',
        'status',
    ];

    protected $casts = [
        'object_props' => 'array',
        'x_position' => 'float',
        'y_position' => 'float',
        'rotation' => 'float',
    ];

    public function setup()
    {
        return $this->belongsTo(VenueSetup::class, 'setup_id', 'setup_id');
    }

    public function object()
    {
        return $this->belongsTo(VenueObject::class, 'object_id', 'object_id');
    }
}
