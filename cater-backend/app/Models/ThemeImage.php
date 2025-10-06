<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThemeImage extends Model
{
    protected $primaryKey = 'image_id';
    protected $fillable = ['theme_id', 'image_url'];
    public $timestamps = true;

    public function theme()
    {
        return $this->belongsTo(Theme::class, 'theme_id', 'theme_id');
    }
}
