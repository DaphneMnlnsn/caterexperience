<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingChangeRequest extends Model
{
    use HasFactory;

    protected $table = 'booking_change_requests';

    protected $fillable = [
        'booking_id',
        'customer_id',
        'request_text',
        'status',
    ];

    public function booking()
    {
        return $this->belongsTo(EventBooking::class, 'booking_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
}