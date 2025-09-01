<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'auditlog';
    protected $primaryKey = 'auditlog_id';
    public $timestamps = false;

    protected $fillable = [
        'action',
        'timestamp',
        'details',
    ];

    public function auditable()
    {
        return $this->morphTo();
    }
}
