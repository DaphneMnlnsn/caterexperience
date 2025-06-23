<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $table = 'task';
    protected $primaryKey = 'task_id';

    protected $fillable = [
        'booking_id',
        'assigned_to',
        'created_by',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'auto_generated',
    ];

    protected $casts = [
        'due_date' => 'date',
        'auto_generated' => 'boolean',
    ];

    public function booking()
    {
        return $this->belongsTo(EventBooking::class, 'booking_id', 'booking_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
