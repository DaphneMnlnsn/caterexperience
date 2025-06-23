<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackagePrice extends Model
{
    protected $table = 'package_price';
    protected $primaryKey = 'package_price_id';
    public $timestamps = false;

    protected $fillable = [
        'package_id',
        'price_label',
        'price_amount',
        'pax',
        'status',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id', 'package_id');
    }
}
