<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'menu';
    protected $primaryKey = 'menu_id';
    public $timestamps = false;

    protected $fillable = [
        'menu_name',
        'menu_description',
        'menu_price',
    ];

    public function foods()
    {
        return $this->belongsToMany(Food::class, 'menu_food', 'menu_id', 'food_id');
    }
}
