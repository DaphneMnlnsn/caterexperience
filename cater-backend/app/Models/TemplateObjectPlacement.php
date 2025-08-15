<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateObjectPlacement extends Model
{
    use HasFactory;

    protected $primaryKey = 'placement_id';

    protected $fillable = [
        'template_id',
        'object_id',
        'x_position',
        'y_position',
        'rotation',
        'object_props',
        'status',
    ];

    public function object()
    {
        return $this->belongsTo(VenueObject::class, 'object_id', 'object_id');
    }

    public function template()
    {
        return $this->belongsTo(TemplateSetup::class, 'template_id', 'template_id');
    }
}

