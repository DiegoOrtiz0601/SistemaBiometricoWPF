<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Empleado;
use App\Models\Empresa;
use App\Models\Sede;
use App\Models\Area;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats()
    {
        try {
            // Mapeo de tipos de empleado
            $tiposEmpleado = [
                1 => 'ENROLADO NO MARCA',
                2 => 'ENROLADO MARCA - SIN SEGUIMIENTO',
                3 => 'ENROLADO MARCA - CON SEGUIMIENTO',
                4 => 'ENROLADO ROTATIVO'
            ];

            // Estadísticas de Empleados
            $empleadosPorTipo = DB::table('SegundaDataBaseRegistros_Test.dbo.Empleados')
                ->select('IdTipoEmpleado as tipo', DB::raw('count(*) as cantidad'))
                ->groupBy('IdTipoEmpleado')
                ->get()
                ->map(function($item) use ($tiposEmpleado) {
                    return [
                        'tipo' => $tiposEmpleado[$item->tipo] ?? 'Tipo '.$item->tipo,
                        'cantidad' => $item->cantidad
                    ];
                });

            $empleados = [
                'total' => DB::table('SegundaDataBaseRegistros_Test.dbo.Empleados')->count(),
                'activos' => DB::table('SegundaDataBaseRegistros_Test.dbo.Empleados')->where('Estado', 1)->count(),
                'inactivos' => DB::table('SegundaDataBaseRegistros_Test.dbo.Empleados')->where('Estado', 0)->count(),
                'porTipo' => $empleadosPorTipo
            ];

            // Estadísticas de Empresas
            $empresas = [
                'total' => DB::table('SegundaDataBaseRegistros_Test.dbo.Empresa')->count(),
                'activas' => DB::table('SegundaDataBaseRegistros_Test.dbo.Empresa')->where('Estado', 1)->count(),
                'inactivas' => DB::table('SegundaDataBaseRegistros_Test.dbo.Empresa')->where('Estado', 0)->count(),
                'empleadosPorEmpresa' => DB::table('SegundaDataBaseRegistros_Test.dbo.Empresa')
                    ->select('Nombre as nombre', DB::raw('(SELECT COUNT(*) FROM SegundaDataBaseRegistros_Test.dbo.Empleados WHERE IdEmpresa = Empresa.IdEmpresa) as empleados'))
                    ->where('Estado', 1)
                    ->get()
            ];

            // Estadísticas de Sedes
            $sedes = [
                'total' => DB::table('Sede')->count(),
                'activas' => DB::table('Sede')->where('Estado', 1)->count(),
                'inactivas' => DB::table('Sede')->where('Estado', 0)->count(),
                'empleadosPorSede' => DB::table('Sede as s')
                    ->join('SegundaDataBaseRegistros_Test.dbo.Empresa as e', 's.IdEmpresa', '=', 'e.IdEmpresa')
                    ->select(
                        's.Nombre as nombre',
                        'e.Nombre as empresa',
                        DB::raw('(SELECT COUNT(*) FROM SegundaDataBaseRegistros_Test.dbo.Empleados WHERE IdSede = s.IdSede) as empleados')
                    )
                    ->where('s.Estado', 1)
                    ->get()
                    ->map(function($sede) {
                        return [
                            'nombre' => $sede->nombre . ' (' . $sede->empresa . ')',
                            'empleados' => $sede->empleados
                        ];
                    })
            ];

            // Estadísticas de Áreas
            $areas = [
                'total' => DB::table('Areas')->count(),
                'activas' => DB::table('Areas')->where('Estado', 1)->count(),
                'inactivas' => DB::table('Areas')->where('Estado', 0)->count(),
                'empleadosPorArea' => DB::table('Areas as a')
                    ->join('Sede as s', 'a.IdSede', '=', 's.IdSede')
                    ->select(
                        'a.Nombre as nombre',
                        's.Nombre as sede',
                        DB::raw('(SELECT COUNT(*) FROM SegundaDataBaseRegistros_Test.dbo.Empleados WHERE IdArea = a.IdArea) as empleados')
                    )
                    ->where('a.Estado', 1)
                    ->get()
                    ->map(function($area) {
                        return [
                            'nombre' => $area->nombre . ' (' . $area->sede . ')',
                            'empleados' => $area->empleados
                        ];
                    })
            ];

            return response()->json([
                'status' => 'success',
                'data' => [
                    'empleados' => $empleados,
                    'empresas' => $empresas,
                    'sedes' => $sedes,
                    'areas' => $areas
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }
} 