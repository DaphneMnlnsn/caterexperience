<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffAssignment extends Model
{
    protected $table = 'staff_assignment';
    protected $primaryKey = 'assignment_id';

    protected $fillable = [
        'booking_id',
        'user_id',
    ];

    public function booking()
    {
        return $this->belongsTo(EventBooking::class, 'booking_id', 'booking_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
