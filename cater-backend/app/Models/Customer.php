<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens;
    
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
