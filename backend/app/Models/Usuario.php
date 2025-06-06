<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Usuario extends Model
{
    use HasFactory;

    protected $table = 'Usuario';
    protected $primaryKey = 'IdUsuario';
    public $timestamps = false;
    protected $connection = 'sqlsrv';

    protected $fillable = [
        'NombreUsuario',
        'Nombre',
        'Contrasena',
        'FechaCreacion',
        'Correo',
        'estado',
        'RolUsuario'
    ];

    protected $casts = [
        'IdUsuario' => 'integer',
        'RolUsuario' => 'integer',
        'estado' => 'boolean',
        'FechaCreacion' => 'datetime'
    ];

    public function rol()
    {
        return $this->belongsTo(RolUsuario::class, 'RolUsuario', 'idRolUsuario');
    }
} 