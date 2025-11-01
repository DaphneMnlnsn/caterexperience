<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Theme extends Model
{
    protected $table = 'themes';
    protected $primaryKey = 'theme_id';
    public $timestamps = false;

    protected $fillable = [
        'theme_name',
        'theme_description',
        'theme_image_url',
        'primary_color',
        'secondary_color',
        'accent_color',
        'theme_status',
    ];

    public function images()
    {
        return $this->hasMany(ThemeImage::class, 'theme_id', 'theme_id');
    }
}
