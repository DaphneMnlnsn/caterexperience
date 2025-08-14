<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateSetup extends Model
{
    use HasFactory;

    protected $primaryKey = 'template_id';

    protected $fillable = [
        'template_name',
        'layout_type',
        'notes',
    ];

    public function placements()
    {
        return $this->hasMany(TemplateObjectPlacement::class, 'template_id', 'template_id');
    }
}