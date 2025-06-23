<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payment';

    protected $primaryKey = 'payment_id';

    protected $fillable = [
        'booking_id',
        'amount_paid',
        'payment_method',
        'payment_date',
        'payment_status',
        'proof_image',
        'remarks',
        'cash_given',
        'change_given',
    ];

    protected $casts = [
        'amount_paid' => 'float',
        'cash_given' => 'float',
        'change_given' => 'float',
        'payment_date' => 'date',
    ];

    public function booking()
    {
        return $this->belongsTo(EventBooking::class, 'booking_id', 'booking_id');
    }
}
