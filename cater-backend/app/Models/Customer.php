<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasApiTokens, Notifiable;
    
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

    public function getAuthPassword()
    {
        return $this->customer_password;
    }

    public function getRoleAttribute()
    {
        return 'client';
    }

    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'auditable');
    }
}
