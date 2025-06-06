<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'Empresa';
    protected $primaryKey = 'IdEmpresa';
    public $timestamps = false;

    protected $fillable = [
        'Nombre',
        'Estado'
    ];

    // Relación con Empleados
    public function empleados(): HasMany
    {
        return $this->hasMany(Empleado::class, 'IdEmpresa', 'IdEmpresa');
    }

    public function sedes()
    {
        return $this->hasMany(Sede::class, 'IdEmpresa', 'IdEmpresa');
    }
} 