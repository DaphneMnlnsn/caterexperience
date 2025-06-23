<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $table = 'packages';
    protected $primaryKey = 'package_id';
    public $timestamps = false;

    protected $fillable = [
        'package_name',
        'package_price',
        'package_description',
        'package_type',
        'package_status',
    ];

    public function prices()
    {
        return $this->hasMany(PackagePrice::class, 'package_id', 'package_id');
    }
}
