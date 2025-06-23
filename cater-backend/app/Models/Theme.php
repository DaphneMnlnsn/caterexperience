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
        'theme_status',
    ];
}
