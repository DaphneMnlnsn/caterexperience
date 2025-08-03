<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAddon extends Model
{
    protected $table = 'event_addon';

    protected $fillable = [
        'booking_id',
        'addon_id',
        'addon_price_id',
        'quantity',
        'total_price',
    ];

    protected $casts = [
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

    public function addonPrice()
    {
        return $this->belongsTo(AddonPrice::class, 'addon_price_id', 'addon_price_id');
    }
}
