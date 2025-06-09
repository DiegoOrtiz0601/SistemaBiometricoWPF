<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AsignacionHorario extends Model
{
    protected $table = 'AsignacionHorarios';
    protected $primaryKey = 'Id';
    public $timestamps = false;

    protected $fillable = [
        'Id',
        'IdEmpleado',
        'FechaInicio',
        'FechaFin',
        'FechaCreacion',
        'CreadoPor',
        'Estado',
        'TipoHorario'
    ];

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class, 'IdEmpleado', 'IdEmpleado');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleHorario::class, 'IdAsignacion', 'Id');
    }
} 