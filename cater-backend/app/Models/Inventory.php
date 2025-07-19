<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'inventory';
    protected $primaryKey = 'item_id';
    public $timestamps = false;

    protected $fillable = [
        'item_name',
        'item_quantity',
        'item_current_quantity',
        'item_unit',
        'item_price',
        'item_type',
        'item_status',
        'last_updated_on',
        'last_updated_by',
    ];

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'last_updated_by');
    }
}
