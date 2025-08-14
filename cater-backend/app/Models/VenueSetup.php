<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VenueSetup extends Model
{
    protected $table = 'venue_setup';
    protected $primaryKey = 'setup_id';

    protected $fillable = [
        'booking_id',
        'layout_name',
        'layout_type',
        'notes',
        'status',
    ];

    public function booking()
    {
        return $this->belongsTo(EventBooking::class, 'booking_id', 'booking_id');
    }

    public function placements()
    {
        return $this->hasMany(VenueObjectPlacement::class, 'setup_id', 'setup_id');
    }
}
