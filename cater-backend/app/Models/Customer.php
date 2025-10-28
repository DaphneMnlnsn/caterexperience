<?php

namespace App\Models;

use App\Notifications\CustomResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable implements CanResetPassword
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
        'require_pass_change',
    ];

    protected $hidden = [
        'customer_password',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function bookings()
    {
        return $this->hasMany(EventBooking::class, 'customer_id');
    }

    public function getAuthPassword()
    {
        return $this->customer_password;
    }

    public function getEmailForPasswordReset()
    {
        return $this->customer_email;
    }

    public function getEmailAttribute()
    {
        return $this->customer_email;
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
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
