<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $table = 'customers';
    protected $primaryKey = 'customer_id';
    public $timestamps = false;

    protected $fillable = [
        'customer_lastname',
        'customer_firstname',
        'customer_middlename',
        'customer_email',
        'customer_password',
        'customer_phone',
        'customer_address',
        'archived',
    ];

    protected $hidden = [
        'customer_password',
    ];

    public function bookings()
    {
        return $this->hasMany(EventBooking::class, 'customer_id');
    }
}
