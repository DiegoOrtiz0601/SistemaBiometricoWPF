<?php

namespace App\Http\Controllers;

use App\Models\Sede;
use App\Models\Empresa;
use App\Models\Ciudad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class SedeController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Sede::with(['empresa', 'ciudad'])
                ->select('Sede.*');

            // Búsqueda
            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('Nombre', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('empresa', function($q) use ($searchTerm) {
                          $q->where('Nombre', 'LIKE', "%{$searchTerm}%");
                      })
                      ->orWhereHas('ciudad', function($q) use ($searchTerm) {
                          $q->where('Nombre', 'LIKE', "%{$searchTerm}%");
                      });
                });
            }

            // Ordenamiento
            $sortField = $request->input('sortField', 'Nombre');
            $sortDirection = $request->input('sortDirection', 'asc');
            
            $query->orderBy($sortField, $sortDirection);

            // Paginación
            $perPage = $request->input('perPage', 10);
            $sedes = $query->paginate($perPage);

            // Transformar los datos para incluir los nombres relacionados
            $sedes->getCollection()->transform(function ($sede) {
                $sede->NombreEmpresa = optional($sede->empresa)->Nombre;
                $sede->NombreCiudad = optional($sede->ciudad)->Nombre;
                return $sede;
            });

            return $sedes;
            
        } catch (\Exception $e) {
            Log::error('Error en SedeController@index: ' . $e->getMessage());
            return response()->json(['error' => 'Error al cargar las sedes'], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'Nombre' => 'required|string|max:255',
            'IdEmpresa' => 'required|integer|exists:Empresa,IdEmpresa',
            'IdCiudad' => 'required|integer|exists:Ciudad,IdCiudad',
            'Estado' => 'required|boolean'
        ]);

        // Aseguramos que Estado sea booleano
        $estado = filter_var($request->Estado, FILTER_VALIDATE_BOOLEAN);

        $id = DB::table('Sede')->insertGetId([
            'Nombre' => strtoupper($request->Nombre),
            'IdEmpresa' => $request->IdEmpresa,
            'IdCiudad' => $request->IdCiudad,
            'Estado' => $estado,
            'IdUsuario' => 1 // Temporal, deberá ser reemplazado por el usuario autenticado
        ]);

        return Response::json([
            'status' => 'success',
            'message' => 'Sede creada exitosamente',
            'data' => ['IdSede' => $id]
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'Nombre' => 'required|string|max:255',
            'IdEmpresa' => 'required|integer|exists:Empresa,IdEmpresa',
            'IdCiudad' => 'required|integer|exists:Ciudad,IdCiudad',
            'Estado' => 'required|boolean'
        ]);

        // Aseguramos que Estado sea booleano
        $estado = filter_var($request->Estado, FILTER_VALIDATE_BOOLEAN);

        $updated = DB::table('Sede')
            ->where('IdSede', $id)
            ->update([
                'Nombre' => strtoupper($request->Nombre),
                'IdEmpresa' => $request->IdEmpresa,
                'IdCiudad' => $request->IdCiudad,
                'Estado' => $estado,
                'IdUsuario' => 1 // Temporal, deberá ser reemplazado por el usuario autenticado
            ]);

        if (!$updated) {
            return Response::json([
                'status' => 'error',
                'message' => 'Sede no encontrada'
            ], 404);
        }

        return Response::json([
            'status' => 'success',
            'message' => 'Sede actualizada exitosamente'
        ]);
    }

    public function destroy($id)
    {
        $deleted = DB::table('Sede')
            ->where('IdSede', $id)
            ->delete();

        if (!$deleted) {
            return Response::json([
                'status' => 'error',
                'message' => 'Sede no encontrada'
            ], 404);
        }

        return Response::json([
            'status' => 'success',
            'message' => 'Sede eliminada exitosamente'
        ]);
    }

    public function getEmpresas()
    {
        $empresas = DB::table('Empresa')
            ->where('Estado', true)
            ->select('IdEmpresa', 'Nombre')
            ->orderBy('Nombre')
            ->get();

        return Response::json($empresas);
    }

    public function getCiudades()
    {
        $ciudades = DB::table('Ciudad')
            ->where('Estado', true)
            ->select('IdCiudad', 'Nombre')
            ->orderBy('Nombre')
            ->get();

        return Response::json($ciudades);
    }

    public function getSedesPorEmpresa($idEmpresa)
    {
        $sedes = DB::table('Sede')
            ->where('IdEmpresa', $idEmpresa)
            ->where('Estado', true)
            ->select('IdSede', 'Nombre')
            ->orderBy('Nombre')
            ->get();

        return Response::json([
            'status' => 'success',
            'data' => $sedes
        ]);
    }

    public function sedesPorEmpresa($idEmpresa)
    {
        try {
            $sedes = DB::table('Sede')
                ->select('IdSede', 'Nombre')
                ->where('IdEmpresa', $idEmpresa)
                ->where('Estado', 1)
                ->orderBy('Nombre')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $sedes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las sedes: ' . $e->getMessage()
            ], 500);
        }
    }
} 