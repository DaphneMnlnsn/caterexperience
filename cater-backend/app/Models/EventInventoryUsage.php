<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventInventoryUsage extends Model
{
    protected $table = 'event_inventory_usage';
    protected $primaryKey = 'usage_id';

    protected $fillable = [
        'booking_inventory_id',
        'quantity_used',
        'quantity_returned',
        'remarks',
    ];

    public function bookingInventory()
    {
        return $this->belongsTo(BookingInventory::class, 'booking_inventory_id');
    }
}
