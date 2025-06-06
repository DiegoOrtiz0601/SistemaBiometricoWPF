<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RolUsuario extends Model
{
    use HasFactory;

    protected $table = 'RolUsuario';
    protected $primaryKey = 'idRolUsuario';
    public $timestamps = false;
    protected $connection = 'sqlsrv';

    protected $fillable = [
        'nombreRol'
    ];

    protected $casts = [
        'idRolUsuario' => 'integer'
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'RolUsuario', 'idRolUsuario');
    }
} 