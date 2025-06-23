<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAddon extends Model
{
    protected $table = 'event_addon';

    protected $fillable = [
        'booking_id',
        'addon_id',
        'quantity',
        'price_each',
        'total_price',
        'remarks',
    ];

    protected $casts = [
        'price_each' => 'float',
        'total_price' => 'float',
        'quantity' => 'integer',
    ];

    public function booking()
    {
        return $this->belongsTo(EventBooking::class, 'booking_id', 'booking_id');
    }

    public function addon()
    {
        return $this->belongsTo(Addon::class, 'addon_id', 'addon_id');
    }
}
