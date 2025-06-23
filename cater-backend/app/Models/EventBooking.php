<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventBooking extends Model
{
    protected $table = 'event_booking';
    protected $primaryKey = 'booking_id';

    protected $fillable = [
        'customer_id',
        'package_id',
        'menu_id',
        'theme_id',
        'event_name',
        'event_type',
        'event_date',
        'event_start_time',
        'event_end_time',
        'event_location',
        'celebrant_name',
        'age',
        'pax',
        'event_total_price',
        'price_breakdown',
        'special_request',
        'booking_status',
    ];

    protected $casts = [
        'price_breakdown' => 'array',
    ];

    public function customer() {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }

    public function package() {
        return $this->belongsTo(Package::class, 'package_id', 'package_id');
    }

    public function menu() {
        return $this->belongsTo(Menu::class, 'menu_id', 'menu_id');
    }

    public function theme() {
        return $this->belongsTo(Theme::class, 'theme_id', 'theme_id');
    }
}
