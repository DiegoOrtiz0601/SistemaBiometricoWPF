<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Ciudad;
use App\Models\Empresa;
use App\Models\Empleado;

class Sede extends Model
{
    use HasFactory;

    protected $table = 'Sede';
    protected $primaryKey = 'IdSede';
    public $timestamps = false;
    
    protected $fillable = [
        'Nombre',
        'IdEmpresa',
        'IdCiudad',
        'Estado'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'IdEmpresa', 'IdEmpresa');
    }

    public function ciudad()
    {
        return $this->belongsTo(Ciudad::class, 'IdCiudad', 'IdCiudad');
    }

    public function empleados()
    {
        return $this->hasMany(Empleado::class, 'IdSede', 'IdSede');
    }
} 