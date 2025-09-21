<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExtraCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'description',
        'amount',
    ];

    public function booking()
    {
        return $this->belongsTo(EventBooking::class,'booking_id', 'booking_id');
    }
}