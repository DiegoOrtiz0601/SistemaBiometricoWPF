<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;

class AreaController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('Areas')
            ->join('Sede', 'Areas.IdSede', '=', 'Sede.IdSede')
            ->select(
                'Areas.IdArea',
                'Areas.IdSede',
                'Areas.Nombre',
                'Areas.Estado',
                'Sede.Nombre as NombreSede'
            )
            ->where('Sede.Estado', '=', true); // Solo sedes activas
        
        // Búsqueda
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('Areas.Nombre', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('Sede.Nombre', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Ordenamiento
        $sortField = $request->input('sortField', 'Areas.Nombre');
        $sortDirection = $request->input('sortDirection', 'asc');
        
        // Asegurarnos de que el campo de ordenamiento use el prefijo correcto
        if ($sortField === 'Area.Nombre') {
            $sortField = 'Areas.Nombre';
        }
        
        $query->orderBy($sortField, $sortDirection);

        // Paginación
        $perPage = $request->input('perPage', 10);
        $areas = $query->paginate($perPage);

        // Convertir explícitamente el estado a booleano
        $areas->through(function ($area) {
            $area->Estado = (bool) $area->Estado;
            return $area;
        });

        return Response::json($areas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Nombre' => 'required|string|max:255',
            'IdSede' => 'required|integer|exists:Sede,IdSede',
            'Estado' => 'required|boolean'
        ]);

        // Aseguramos que Estado sea booleano
        $estado = filter_var($request->Estado, FILTER_VALIDATE_BOOLEAN);

        $id = DB::table('Areas')->insertGetId([
            'Nombre' => strtoupper($request->Nombre),
            'IdSede' => $request->IdSede,
            'Estado' => $estado
        ]);

        return Response::json([
            'status' => 'success',
            'message' => 'Área creada exitosamente',
            'data' => ['IdArea' => $id]
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'Nombre' => 'required|string|max:255',
            'IdSede' => 'required|integer|exists:Sede,IdSede',
            'Estado' => 'required|boolean'
        ]);

        // Aseguramos que Estado sea booleano
        $estado = filter_var($request->Estado, FILTER_VALIDATE_BOOLEAN);

        $updated = DB::table('Areas')
            ->where('IdArea', $id)
            ->update([
                'Nombre' => strtoupper($request->Nombre),
                'IdSede' => $request->IdSede,
                'Estado' => $estado
            ]);

        if (!$updated) {
            return Response::json([
                'status' => 'error',
                'message' => 'Área no encontrada'
            ], 404);
        }

        return Response::json([
            'status' => 'success',
            'message' => 'Área actualizada exitosamente'
        ]);
    }

    public function destroy($id)
    {
        $deleted = DB::table('Areas')
            ->where('IdArea', $id)
            ->delete();

        if (!$deleted) {
            return Response::json([
                'status' => 'error',
                'message' => 'Área no encontrada'
            ], 404);
        }

        return Response::json([
            'status' => 'success',
            'message' => 'Área eliminada exitosamente'
        ]);
    }

    public function getSedes()
    {
        try {
            $sedes = DB::table('Sede')
                ->select(
                    'IdSede',
                    'Nombre',
                    'IdEmpresa',
                    'IdCiudad',
                    'Estado'
                )
                ->where('Estado', '=', 1)
                ->orderBy('Nombre', 'asc')
                ->get();

            if ($sedes->isEmpty()) {
                return Response::json([
                    'status' => 'warning',
                    'message' => 'No hay sedes activas disponibles',
                    'data' => []
                ]);
            }

            return Response::json([
                'status' => 'success',
                'data' => $sedes
            ]);

        } catch (\Exception $e) {
            return Response::json([
                'status' => 'error',
                'message' => 'Error al obtener las sedes: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAreasPorSede($idSede)
    {
        $areas = DB::table('Areas')
            ->where('IdSede', $idSede)
            ->where('Estado', true)
            ->select('IdArea', 'Nombre')
            ->orderBy('Nombre')
            ->get();

        return Response::json([
            'status' => 'success',
            'data' => $areas
        ]);
    }

    public function areasPorSede($idSede)
    {
        try {
            // Primero verificamos que la sede exista y esté activa
            $sedeExists = DB::table('Sede')
                ->where('IdSede', $idSede)
                ->where('Estado', 1)
                ->exists();

            if (!$sedeExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'La sede especificada no existe o no está activa'
                ], 404);
            }

            $areas = DB::table('Areas')  // Cambiado de 'Area' a 'Areas'
                ->where('IdSede', $idSede)
                ->where('Estado', 1)
                ->select('IdArea as id', 'Nombre as nombre')
                ->orderBy('Nombre')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $areas
            ]);
        } catch (\Exception $e) {
            Log::error('Error en areasPorSede: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las áreas: ' . $e->getMessage()
            ], 500);
        }
    }
} 