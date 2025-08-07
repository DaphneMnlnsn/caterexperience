<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VenueObject extends Model
{
    protected $table = 'venue_objects';
    protected $primaryKey = 'object_id';
    public $timestamps = false;

    protected $fillable = [
        'object_name',
        'object_type',
        'object_props',
        'default_x',
        'default_y',
        'default_rotation',
        'default_scale',
        'z_index',
        'archived',
    ];

    protected $casts = [
        'object_props'     => 'array',
        'default_x'        => 'float',
        'default_y'        => 'float',
        'default_rotation' => 'float',
        'default_scale'    => 'float',
        'z_index'          => 'integer',
    ];
}
