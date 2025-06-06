<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class CiudadController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('Ciudad');
            
            // Búsqueda
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where('Nombre', 'LIKE', "%{$searchTerm}%");
            }

            // Ordenamiento
            $sortField = $request->input('sortField', 'Nombre');
            $sortDirection = $request->input('sortDirection', 'asc');
            $query->orderBy($sortField, $sortDirection);

            // Paginación
            $perPage = (int) $request->input('perPage', 10);
            $ciudades = $query->paginate($perPage);

            // Transformar los datos para mantener consistencia con el frontend
            $data = collect($ciudades->items())->map(function ($ciudad) {
                return [
                    'id' => $ciudad->IdCiudad,
                    'nombre' => $ciudad->Nombre,
                    'estado' => $ciudad->Estado ? "1" : "0"
                ];
            });

            return Response::json([
                'success' => true,
                'data' => $data,
                'current_page' => $ciudades->currentPage(),
                'last_page' => $ciudades->lastPage(),
                'per_page' => (int) $ciudades->perPage(),
                'total' => $ciudades->total()
            ]);

        } catch (\Exception $e) {
            Log::error('Error en CiudadController@index: ' . $e->getMessage());
            return Response::json([
                'success' => false,
                'message' => 'Error al cargar las ciudades'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255'
            ]);

            $id = DB::table('Ciudad')->insertGetId([
                'Nombre' => strtoupper($request->nombre),
                'Estado' => true
            ]);

            return Response::json([
                'success' => true,
                'message' => 'Ciudad creada exitosamente',
                'data' => ['id' => $id]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error en CiudadController@store: ' . $e->getMessage());
            return Response::json([
                'success' => false,
                'message' => 'Error al crear la ciudad'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255',
                'estado' => 'required|string|in:0,1'
            ]);

            $updated = DB::table('Ciudad')
                ->where('IdCiudad', $id)
                ->update([
                    'Nombre' => strtoupper($request->nombre),
                    'Estado' => $request->estado === "1"
                ]);

            if (!$updated) {
                return Response::json([
                    'success' => false,
                    'message' => 'Ciudad no encontrada'
                ], 404);
            }

            return Response::json([
                'success' => true,
                'message' => 'Ciudad actualizada exitosamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error en CiudadController@update: ' . $e->getMessage());
            return Response::json([
                'success' => false,
                'message' => 'Error al actualizar la ciudad'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = DB::table('Ciudad')
                ->where('IdCiudad', $id)
                ->delete();

            if (!$deleted) {
                return Response::json([
                    'success' => false,
                    'message' => 'Ciudad no encontrada'
                ], 404);
            }

            return Response::json([
                'success' => true,
                'message' => 'Ciudad eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error en CiudadController@destroy: ' . $e->getMessage());
            return Response::json([
                'success' => false,
                'message' => 'Error al eliminar la ciudad'
            ], 500);
        }
    }

    public function ciudadesActivas()
    {
        try {
            $ciudades = DB::table('Ciudad')
                ->select('IdCiudad as id', 'Nombre as nombre')
                ->where('Estado', 1)
                ->orderBy('Nombre')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $ciudades
            ]);
        } catch (\Exception $e) {
            Log::error('Error en ciudadesActivas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las ciudades: ' . $e->getMessage()
            ], 500);
        }
    }
} 