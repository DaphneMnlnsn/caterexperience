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
        'object_category',
        'object_width',
        'object_height',
        'image_url',
        'archived',
    ];
}
