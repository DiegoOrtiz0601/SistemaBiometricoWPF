<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ciudad extends Model
{
    use HasFactory;

    protected $table = 'Ciudad';
    protected $primaryKey = 'IdCiudad';
    public $timestamps = false;
    
    protected $fillable = [
        'Nombre',
        'Estado'
    ];

    public function sedes()
    {
        return $this->hasMany(Sede::class, 'IdCiudad', 'IdCiudad');
    }
} 