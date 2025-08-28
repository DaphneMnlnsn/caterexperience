<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuFood extends Model
{
    protected $table = 'menu_food';
    public $timestamps = false;

    protected $fillable = [
        'menu_id',
        'food_id',
        'status',
        'completed_at',
    ];

    public function food()
    {
        return $this->belongsTo(Food::class, 'food_id');
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}