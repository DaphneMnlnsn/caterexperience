<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EventBooking extends Model
{
    protected $table = 'event_booking';
    protected $primaryKey = 'booking_id';

    protected $fillable = [
        'customer_id',
        'package_id',
        'package_price_id',
        'menu_id',
        'theme_id',
        'event_name',
        'event_type',
        'event_date',
        'event_start_time',
        'event_end_time',
        'event_location',
        'event_code',
        'celebrant_name',
        'age',
        'watcher',
        'waiter_count',
        'pax',
        'event_total_price',
        'price_breakdown',
        'freebies',
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

    public function packagePrice() {
        return $this->belongsTo(PackagePrice::class, 'package_price_id', 'package_price_id');
    }

    public function menu() {
        return $this->belongsTo(Menu::class, 'menu_id', 'menu_id')->with('foods');
    }

    public function theme() {
        return $this->belongsTo(Theme::class, 'theme_id', 'theme_id');
    }
    public function staffAssignments()
    {
        return $this->hasMany(StaffAssignment::class, 'booking_id', 'booking_id')->with('user');
    }
    public function payments()
    {
        return $this->hasMany(Payment::class, 'booking_id', 'booking_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'booking_id', 'booking_id');
    }
    public function eventAddons()
    {
        return $this->hasMany(EventAddon::class, 'booking_id');
    }

    public function menuFoods()
    {
        return $this->hasMany(MenuFood::class, 'menu_id', 'menu_id')->with('food');
    }
    
    protected static function generateReadableCode($length = 6)
    {
        $pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        return substr(str_shuffle(str_repeat($pool, 5)), 0, $length);
    }

    public static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            do {
                $code = 'EVT-' . now()->format('y') . '-' . self::generateReadableCode();
            } while (self::where('event_code', $code)->exists());

            $booking->event_code = $code;
        });
    }
}
