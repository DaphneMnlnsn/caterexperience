<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventInventoryUsage extends Model
{
    protected $table = 'event_inventory_usage';
    protected $primaryKey = 'usage_id';

    protected $fillable = [
        'booking_id',
        'item_id',
        'quantity_used',
        'quantity_returned',
        'notes',
    ];

    protected $casts = [
        'quantity_used' => 'integer',
        'quantity_returned' => 'integer',
    ];

    public function booking()
    {
        return $this->belongsTo(EventBooking::class, 'booking_id', 'booking_id');
    }

    public function item()
    {
        return $this->belongsTo(Inventory::class, 'item_id', 'item_id');
    }
}
