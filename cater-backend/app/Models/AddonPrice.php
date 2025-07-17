<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AddonPrice extends Model
{
    protected $table = 'addon_prices';
    protected $primaryKey = 'addon_price_id';
    protected $fillable = [
        'addon_id', 
        'description', 
        'price'
    ];

    public function addon()
    {
        return $this->belongsTo(Addon::class, 'addon_id', 'addon_id');
    }
}
