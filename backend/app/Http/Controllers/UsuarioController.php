<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\RolUsuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Usuario::with('rol');
            
            // Aplicar búsqueda si existe
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('Nombre', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('NombreUsuario', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('Correo', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Obtener el número de registros por página
            $perPage = $request->input('perPage', 10);
            
            // Realizar la paginación
            $usuarios = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $usuarios->items(),
                'pagination' => [
                    'current_page' => $usuarios->currentPage(),
                    'last_page' => $usuarios->lastPage(),
                    'per_page' => $usuarios->perPage(),
                    'total' => $usuarios->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'NombreUsuario' => 'required|unique:Usuario',
                'Nombre' => 'required',
                'Contrasena' => 'required|min:6',
                'Correo' => 'required|email|unique:Usuario',
                'RolUsuario' => 'required|exists:RolUsuario,idRolUsuario'
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            $usuario = new Usuario($request->all());
            $usuario->Contrasena = Hash::make($request->Contrasena);
            $usuario->FechaCreacion = now();
            $usuario->estado = true;
            $usuario->save();

            return response()->json(['success' => true, 'data' => $usuario->load('rol')], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $usuario = Usuario::with('rol')->findOrFail($id);
            return response()->json(['success' => true, 'data' => $usuario]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'NombreUsuario' => 'required|unique:Usuario,NombreUsuario,'.$id.',IdUsuario',
                'Nombre' => 'required',
                'Correo' => 'required|email|unique:Usuario,Correo,'.$id.',IdUsuario',
                'RolUsuario' => 'required|exists:RolUsuario,idRolUsuario'
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            $usuario->update($request->except('Contrasena'));
            return response()->json(['success' => true, 'data' => $usuario->load('rol')]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            $usuario->estado = false;
            $usuario->save();
            
            return response()->json(['success' => true, 'message' => 'Usuario desactivado correctamente']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function cambiarPassword(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'password_actual' => 'required',
                'password_nuevo' => 'required|min:6|different:password_actual',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }

            $usuario = Usuario::findOrFail($id);
            
            if (!Hash::check($request->password_actual, $usuario->Contrasena)) {
                return response()->json(['success' => false, 'message' => 'La contraseña actual es incorrecta'], 400);
            }

            $usuario->Contrasena = Hash::make($request->password_nuevo);
            $usuario->save();

            return response()->json(['success' => true, 'message' => 'Contraseña actualizada correctamente']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getRoles()
    {
        try {
            $roles = RolUsuario::select('idRolUsuario', 'nombreRol')
                              ->orderBy('nombreRol')
                              ->get();
                              
            return response()->json([
                'success' => true,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los roles: ' . $e->getMessage()
            ], 500);
        }
    }
} 