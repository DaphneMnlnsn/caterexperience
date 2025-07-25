<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingInventory extends Model
{
    protected $table = 'booking_inventory';
    protected $primaryKey = 'booking_inventory_id';
    protected $fillable = [
        'booking_id',
        'item_id',
        'quantity_assigned',
        'remarks',
    ];

    public function item() {
        return $this->belongsTo(Inventory::class, 'item_id');
    }
    public function usage()
    {
        return $this->hasOne(EventInventoryUsage::class, 'booking_inventory_id');
    }
}
