<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    protected $table = 'addons';
    protected $primaryKey = 'addon_id';
    public $timestamps = false;

    protected $fillable = [
        'addon_name',
        'addon_type',
        'addon_description',
        'addon_price',
        'addon_status',
    ];
}
