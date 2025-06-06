<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CiudadController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\SedeController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\AsignacionHorarioController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ReporteController;

Route::post('login', [AuthController::class, 'login']);
Route::get('formatos/plantilla_horarios.csv', [AsignacionHorarioController::class, 'descargarPlantilla']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    
    // Rutas de Ciudades
    Route::get('ciudades', [CiudadController::class, 'index']);
    Route::post('ciudades', [CiudadController::class, 'store']);
    Route::put('ciudades/{id}', [CiudadController::class, 'update']);
    Route::delete('ciudades/{id}', [CiudadController::class, 'destroy']);

    // Rutas de Empresas
    Route::get('empresas', [EmpresaController::class, 'index']);
    Route::post('empresas', [EmpresaController::class, 'store']);
    Route::put('empresas/{id}', [EmpresaController::class, 'update']);
    Route::delete('empresas/{id}', [EmpresaController::class, 'destroy']);
    Route::get('empresas/activas', [EmpresaController::class, 'getActivas']);

    // Rutas para Sedes
    Route::get('/sedes', [SedeController::class, 'index']);
    Route::post('/sedes', [SedeController::class, 'store']);
    Route::put('/sedes/{id}', [SedeController::class, 'update']);
    Route::delete('/sedes/{id}', [SedeController::class, 'destroy']);
    Route::get('/sedes/empresas', [SedeController::class, 'getEmpresas']);
    Route::get('/sedes/ciudades', [SedeController::class, 'getCiudades']);
    Route::get('/sedes/empresa/{idEmpresa}', [SedeController::class, 'getSedesPorEmpresa']);

    // Rutas para Áreas
    Route::get('/areas', [AreaController::class, 'index']);
    Route::post('/areas', [AreaController::class, 'store']);
    Route::put('/areas/{id}', [AreaController::class, 'update']);
    Route::delete('/areas/{id}', [AreaController::class, 'destroy']);
    Route::get('/areas/sedes', [AreaController::class, 'getSedes']);
    Route::get('/areas/sede/{idSede}', [AreaController::class, 'getAreasPorSede']);

    // Rutas para Empleados
    Route::get('/empleados', [EmpleadoController::class, 'index']);
    Route::post('/empleados', [EmpleadoController::class, 'store']);
    Route::put('/empleados/{id}', [EmpleadoController::class, 'update']);
    Route::delete('/empleados/{id}', [EmpleadoController::class, 'destroy']);
    Route::get('/empleados/tipos', [EmpleadoController::class, 'getTiposEmpleado']);
    Route::get('/empleados/buscar', [EmpleadoController::class, 'buscar']);
    Route::get('/empleados/{id}', [EmpleadoController::class, 'show']);

    // Rutas para Asignación de Horarios
    Route::get('/asignacion-horarios', [AsignacionHorarioController::class, 'index']);
    Route::get('/asignacion-horarios/template', [AsignacionHorarioController::class, 'downloadTemplate']);
    Route::post('/asignacion-horarios/carga-masiva', [AsignacionHorarioController::class, 'cargaMasiva']);
    Route::post('/asignacion-horarios', [AsignacionHorarioController::class, 'store']);
    Route::put('/asignacion-horarios/{id}', [AsignacionHorarioController::class, 'update']);
    Route::delete('/asignacion-horarios/{id}', [AsignacionHorarioController::class, 'destroy']);

    // Rutas para Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Rutas de Usuario
    Route::group(['prefix' => 'usuarios'], function () {
        Route::get('/roles', [UsuarioController::class, 'getRoles']);
        Route::get('/', [UsuarioController::class, 'index']);
        Route::post('/', [UsuarioController::class, 'store']);
        Route::get('/{id}', [UsuarioController::class, 'show']);
        Route::put('/{id}', [UsuarioController::class, 'update']);
        Route::delete('/{id}', [UsuarioController::class, 'destroy']);
        Route::post('/{id}/cambiar-password', [UsuarioController::class, 'cambiarPassword']);
    });

    // Rutas para Reportes
    Route::group(['prefix' => 'reportes'], function () {
        Route::get('/empresa', [ReporteController::class, 'reporteEmpresa']);
        Route::get('/empresa/excel', [ReporteController::class, 'exportarExcel']);
        Route::post('/empresa/enviar-correo', [ReporteController::class, 'enviarCorreo']);
    });

    // Rutas para selects de reportes
    Route::get('/empresas/activas', [EmpresaController::class, 'empresasActivas']);
    Route::get('/ciudades/activas', [CiudadController::class, 'ciudadesActivas']);
    Route::get('/sedes/empresa/{idEmpresa}', [SedeController::class, 'sedesPorEmpresa']);
    Route::get('/areas/sede/{idSede}', [AreaController::class, 'areasPorSede']);
}); 