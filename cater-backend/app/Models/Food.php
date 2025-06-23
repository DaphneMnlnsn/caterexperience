<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    protected $table = 'food';
    protected $primaryKey = 'food_id';
    public $timestamps = false;

    protected $fillable = [
        'food_name',
        'food_type',
        'food_description',
        'food_image_url',
        'food_status',
    ];

    public function menus()
    {
        return $this->belongsToMany(Menu::class, 'menu_food', 'food_id', 'menu_id');
    }
}
