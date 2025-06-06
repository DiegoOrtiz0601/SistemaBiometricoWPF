<?php

namespace App\Http\Controllers;

use App\Models\AsignacionHorario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use DateTime;
use Exception;

class AsignacionHorarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            DB::enableQueryLog();

            $query = AsignacionHorario::with(['empleado' => function($query) {
                $query->select('IdEmpleado', 'Nombres', 'Apellidos', 'Documento', 'IdEmpresa', 'IdTipoEmpleado', 'Estado')
                      ->with([
                          'empresa' => function($q) {
                              $q->select('IdEmpresa', 'Nombre');
                          },
                          'tipoEmpleado' => function($q) {
                              $q->select('id', 'nombre');
                          }
                      ]);
            }])
            ->with(['detalles' => function($query) {
                $query->select('Id', 'IdAsignacion', 'DiaSemana', 'HoraInicio', 'HoraFin')
                      ->orderBy('DiaSemana');
            }])
            ->select('Id', 'IdEmpleado', 'FechaInicio', 'FechaFin', 'FechaCreacion', 'CreadoPor', 'Estado', 'TipoHorario')
            ->where('Estado', '1'); // Filtrar solo horarios activos

            // Filtrar por ID específico si se proporciona
            if ($request->has('horario_id')) {
                $query->where('Id', $request->horario_id);
                Log::info('Buscando horario específico:', ['horario_id' => $request->horario_id]);
            }

            // Búsqueda
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->whereHas('empleado', function($q) use ($searchTerm) {
                    $q->where('Nombres', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('Apellidos', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('Documento', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Ordenar por fecha de creación descendente
            $query->orderBy('FechaCreacion', 'desc');

            // Paginación
            $perPage = $request->input('perPage', 10);
            $asignaciones = $query->paginate($perPage);

            Log::info('Consultas ejecutadas:', ['queries' => DB::getQueryLog()]);

            if ($asignaciones->isEmpty()) {
                Log::warning('No se encontraron asignaciones activas para los criterios dados');
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No se encontraron asignaciones activas para los criterios dados'
                ]);
            }

            // Transformar los datos
            $asignaciones->through(function($asignacion) {
                $detalles = $asignacion->detalles ? $asignacion->detalles->map(function($detalle) {
                    return [
                        'id' => $detalle->Id,
                        'id_dia_semana' => $detalle->DiaSemana,
                        'hora_inicio' => $detalle->HoraInicio,
                        'hora_fin' => $detalle->HoraFin
                    ];
                })->toArray() : [];

                Log::info('Detalles encontrados para horario ' . $asignacion->Id . ':', ['count' => count($detalles)]);

                return [
                    'id' => $asignacion->Id,
                    'empleado' => [
                        'id' => $asignacion->empleado->IdEmpleado,
                        'nombre_completo' => $asignacion->empleado->Nombres . ' ' . $asignacion->empleado->Apellidos,
                        'documento' => $asignacion->empleado->Documento,
                        'empresa' => $asignacion->empleado->empresa->Nombre ?? 'N/A',
                        'tipo_empleado' => $asignacion->empleado->tipoEmpleado->nombre ?? 'N/A',
                        'estado' => $asignacion->empleado->Estado
                    ],
                    'fecha_inicio' => $asignacion->FechaInicio,
                    'fecha_fin' => $asignacion->FechaFin,
                    'fecha_creacion' => $asignacion->FechaCreacion,
                    'creado_por' => $asignacion->CreadoPor,
                    'estado' => $asignacion->Estado,
                    'tipo_horario' => $asignacion->TipoHorario,
                    'detalles' => $detalles
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $asignaciones->items(),
                'pagination' => [
                    'total' => $asignaciones->total(),
                    'per_page' => $asignaciones->perPage(),
                    'current_page' => $asignaciones->currentPage(),
                    'last_page' => $asignaciones->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en AsignacionHorarioController@index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las asignaciones de horarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cargaMasiva(Request $request)
    {
        try {
            Log::info('Iniciando carga masiva de horarios');
            
            if (!$request->hasFile('archivo')) {
                Log::error('No se proporcionó ningún archivo');
                return response()->json([
                    'success' => false,
                    'message' => 'No se ha proporcionado ningún archivo'
                ], 400);
            }

            $file = $request->file('archivo');
            Log::info('Archivo recibido', [
                'nombre' => $file->getClientOriginalName(),
                'tamaño' => $file->getSize(),
                'tipo' => $file->getMimeType()
            ]);
            
            if ($file->getClientOriginalExtension() !== 'csv') {
                Log::error('Extensión de archivo inválida', [
                    'extension' => $file->getClientOriginalExtension()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo debe ser un CSV'
                ], 400);
            }

            // Obtener mapeo de días y convertir las claves a formato título
            $diasSemana = DB::table('DiasDeLaSemana')
                           ->select('id', 'nombre')
                           ->get()
                           ->mapWithKeys(function($dia) {
                               // Convertir el nombre a formato título (primera letra mayúscula)
                               return [ucfirst(strtolower($dia->nombre)) => $dia->id];
                           })
                           ->toArray();
            
            // Leer el archivo CSV
            $handle = fopen($file->getPathname(), 'r');
            $header = fgetcsv($handle, 0, ';');
            $registros = [];
            $erroresPorDocumento = []; // Array para agrupar errores por documento
            $linea = 2; // Empezamos en 2 porque la línea 1 es el encabezado

            while (($data = fgetcsv($handle, 0, ';')) !== false) {
                // Verificar si la línea tiene datos (al menos un campo no vacío)
                if (array_filter($data)) { // Solo procesa líneas que tienen al menos un dato
                    if (count($data) !== count($header)) {
                        $erroresPorDocumento['Línea ' . $linea] = [
                            'documento' => 'N/A',
                            'errores' => ['Número incorrecto de columnas']
                        ];
                        $linea++;
                        continue;
                    }

                    $registro = array_combine($header, $data);
                    $documento = $registro['Documento'] ?: 'Sin documento';
                    $erroresActuales = [];
                    
                    // Validar el documento del empleado
                    $empleado = DB::table('Empleados')
                        ->where('Documento', $registro['Documento'])
                        ->where('Estado', true)
                        ->first();

                    if (!$empleado) {
                        $erroresActuales[] = "No se encontró el empleado activo con documento {$registro['Documento']}";
                    }

                    // Validar fechas
                    $fechasValidas = true;
                    try {
                        $fechaInicio = new DateTime($registro['FechaInicio']);
                        $fechaFin = new DateTime($registro['FechaFin']);

                        if ($fechaInicio > $fechaFin) {
                            $erroresActuales[] = "La fecha de inicio ({$registro['FechaInicio']}) debe ser anterior a la fecha fin ({$registro['FechaFin']})";
                            $fechasValidas = false;
                        }
                    } catch (Exception $e) {
                        $erroresActuales[] = "Formato de fecha inválido: Inicio({$registro['FechaInicio']}) Fin({$registro['FechaFin']})";
                        $fechasValidas = false;
                    }

                    // Preparar los detalles de horario
                    $detalles = [];
                    $diasColumnas = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']; // Orden correcto empezando por Domingo
                    $erroresHorarios = [];
                    
                    foreach ($diasColumnas as $dia) {
                        if (!empty($registro[$dia])) {
                            // Eliminar espacios en blanco alrededor del separador
                            $horarioLimpio = str_replace(' ', '', $registro[$dia]);
                            $horarios = explode('-', $horarioLimpio);
                            
                            if (count($horarios) !== 2) {
                                $erroresActuales[] = "Formato de horario inválido para {$dia}: {$registro[$dia]}";
                                continue;
                            }

                            // Formatear las horas para asegurar el formato HH:mm
                            $horaInicio = $horarios[0];
                            $horaFin = $horarios[1];

                            // Validar y formatear hora de inicio
                            if (preg_match('/^(\d{1,2}):(\d{2})$/', $horaInicio, $matches)) {
                                $hora = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                                $minutos = $matches[2];
                                if ($hora >= 0 && $hora <= 23 && $minutos >= 0 && $minutos <= 59) {
                                    $horaInicio = "{$hora}:{$minutos}";
                                } else {
                                    $erroresActuales[] = "Hora inválida para {$dia}: {$horaInicio}";
                                    continue;
                                }
                            } else {
                                $erroresActuales[] = "Formato de hora inválido para {$dia}: {$horaInicio}";
                                continue;
                            }

                            // Validar y formatear hora de fin
                            if (preg_match('/^(\d{1,2}):(\d{2})$/', $horaFin, $matches)) {
                                $hora = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
                                $minutos = $matches[2];
                                if ($hora >= 0 && $hora <= 23 && $minutos >= 0 && $minutos <= 59) {
                                    $horaFin = "{$hora}:{$minutos}";
                                } else {
                                    $erroresActuales[] = "Hora inválida para {$dia}: {$horaFin}";
                                    continue;
                                }
                            } else {
                                $erroresActuales[] = "Formato de hora inválido para {$dia}: {$horaFin}";
                                continue;
                            }

                            // Obtener el ID del día
                            $idDia = $diasSemana[$dia] ?? null;
                            if (!$idDia) {
                                $erroresActuales[] = "No se encontró el ID para el día {$dia}";
                                continue;
                            }

                            $detalles[] = [
                                'DiaSemana' => $idDia,
                                'HoraInicio' => $horaInicio,
                                'HoraFin' => $horaFin
                            ];
                        }
                    }

                    if (empty($detalles)) {
                        $erroresActuales[] = "No se especificaron horarios para ningún día";
                    }

                    // Si hay errores, los guardamos agrupados por documento
                    if (!empty($erroresActuales)) {
                        if (!isset($erroresPorDocumento[$documento])) {
                            $erroresPorDocumento[$documento] = [
                                'documento' => $documento,
                                'linea' => $linea,
                                'errores' => []
                            ];
                        }
                        $erroresPorDocumento[$documento]['errores'] = array_merge(
                            $erroresPorDocumento[$documento]['errores'] ?? [],
                            $erroresActuales
                        );
                    } elseif ($empleado && $fechasValidas) {
                        $registros[] = [
                            'empleado' => $empleado,
                            'fechaInicio' => $fechaInicio->format('Y-m-d'),
                            'fechaFin' => $fechaFin->format('Y-m-d'),
                            'detalles' => $detalles
                        ];
                    }
                }
                $linea++;
            }

            fclose($handle);

            if (!empty($erroresPorDocumento)) {
                // Construir mensaje detallado de errores
                $mensajeResumen = [];
                foreach ($erroresPorDocumento as $doc => $datos) {
                    $mensajeResumen[] = "Documento {$datos['documento']}: Ya existe un horario activo para las fechas indicadas";
                }

                return response()->json([
                    'success' => false,
                    'message' => implode("\n", $mensajeResumen),
                    'errores' => [
                        'errores_por_documento' => $erroresPorDocumento
                    ]
                ], 400);
            }

            if (empty($registros)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay registros válidos para procesar'
                ], 400);
            }

            DB::beginTransaction();
            try {
                // Obtener información del usuario autenticado
                $userAuth = Auth::user();
                Log::info('Usuario autenticado:', [
                    'email' => $userAuth->email ?? 'no email',
                    'id' => $userAuth->id ?? 'no id'
                ]);

                // Buscar el usuario en la tabla Usuario
                $usuario = DB::table('Usuario')
                    ->where(function($query) use ($userAuth) {
                        $query->where('Correo', $userAuth->email)
                              ->orWhere('Correo', strtoupper($userAuth->email))
                              ->orWhere('Correo', strtolower($userAuth->email));
                    })
                    ->where('estado', true)
                    ->first();

                Log::info('Resultado búsqueda usuario:', [
                    'usuario_encontrado' => $usuario ? 'sí' : 'no',
                    'datos_usuario' => $usuario
                ]);

                if (!$usuario) {
                    // Si no se encuentra el usuario, usar un valor por defecto
                    Log::warning('No se encontró el usuario en la tabla Usuario, usando valor por defecto');
                    $idUsuarioDefault = 1; // O el ID que corresponda a un usuario administrador
                    $usuario = (object)['IdUsuario' => $idUsuarioDefault];
                }

                $registrosProcesados = 0;
                foreach ($registros as $registro) {
                    // Buscar horarios que se solapan con las nuevas fechas
                    $horariosExistentes = DB::table('AsignacionHorarios')
                        ->where('IdEmpleado', $registro['empleado']->IdEmpleado)
                        ->where('Estado', true)
                        ->where(function($query) use ($registro) {
                            $query->where(function($q) use ($registro) {
                                // Caso 1: La fecha de inicio está dentro del rango existente
                                $q->where('FechaInicio', '<=', $registro['fechaInicio'])
                                  ->where('FechaFin', '>=', $registro['fechaInicio']);
                            })->orWhere(function($q) use ($registro) {
                                // Caso 2: La fecha de fin está dentro del rango existente
                                $q->where('FechaInicio', '<=', $registro['fechaFin'])
                                  ->where('FechaFin', '>=', $registro['fechaFin']);
                            })->orWhere(function($q) use ($registro) {
                                // Caso 3: El nuevo rango contiene completamente al rango existente
                                $q->where('FechaInicio', '>=', $registro['fechaInicio'])
                                  ->where('FechaFin', '<=', $registro['fechaFin']);
                            });
                        })
                        ->get();

                    if ($horariosExistentes->count() > 0) {
                        // Agregar error de solapamiento al array de errores
                        $erroresActuales[] = sprintf(
                            "Ya existe un horario activo para el período %s - %s",
                            $registro['fechaInicio'],
                            $registro['fechaFin']
                        );

                        // Agregar detalles de los horarios que se solapan
                        foreach ($horariosExistentes as $horario) {
                            $erroresActuales[] = sprintf(
                                "→ Horario existente del %s al %s",
                                $horario->FechaInicio,
                                $horario->FechaFin
                            );
                        }

                        // Si hay errores, los guardamos agrupados por documento
                        if (!isset($erroresPorDocumento[$documento])) {
                            $erroresPorDocumento[$documento] = [
                                'documento' => $documento,
                                'linea' => $linea,
                                'errores' => []
                            ];
                        }
                        $erroresPorDocumento[$documento]['errores'] = array_merge(
                            $erroresPorDocumento[$documento]['errores'] ?? [],
                            $erroresActuales
                        );
                        continue; // Saltamos al siguiente registro
                    }

                    // Si no hay errores, procedemos con la creación del nuevo horario
                    if (empty($erroresActuales)) {
                        // Crear la nueva asignación
                        $idAsignacion = DB::table('AsignacionHorarios')->insertGetId([
                            'IdEmpleado' => $registro['empleado']->IdEmpleado,
                            'FechaInicio' => $registro['fechaInicio'],
                            'FechaFin' => $registro['fechaFin'],
                            'FechaCreacion' => now(),
                            'CreadoPor' => $usuario->IdUsuario,
                            'Estado' => true,
                            'TipoHorario' => 1
                        ]);

                        // Crear los detalles del horario
                        foreach ($registro['detalles'] as $detalle) {
                            DB::table('DetalleHorarios')->insert([
                                'IdAsignacion' => $idAsignacion,
                                'DiaSemana' => $detalle['DiaSemana'],
                                'HoraInicio' => $detalle['HoraInicio'],
                                'HoraFin' => $detalle['HoraFin']
                            ]);
                        }
                        $registrosProcesados++;
                    }
                }

                if ($registrosProcesados === 0) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'No se pudo procesar ningún registro debido a conflictos con horarios existentes'
                    ], 400);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => $registrosProcesados === 1 
                        ? "Se procesó 1 registro exitosamente"
                        : "Se procesaron {$registrosProcesados} registros exitosamente"
                ]);
            } catch (Exception $e) {
                DB::rollBack();
                Log::error('Error al procesar registros:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Error al procesar los registros: ' . $e->getMessage()
                ], 500);
            }
        } catch (Exception $e) {
            Log::error('Error al procesar archivo:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el archivo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function descargarPlantilla()
    {
        try {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="plantilla_horarios.csv"',
            ];

            $contenido = "Lunes;Martes;Miercoles;Jueves;Viernes;Sabado;Domingo;Documento;FechaInicio;FechaFin\n";
            $contenido .= "07:00-17:30;07:00-17:30;07:00-17:30;07:00-17:30;07:00-17:30;07:00-17:30;07:00-17:30;12345678;2025-01-01;2025-01-31\n";

            return response($contenido, 200, $headers);
        } catch (Exception $e) {
            Log::error('Error al descargar plantilla:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al descargar la plantilla'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            // Verificar que la asignación existe
            $asignacionActual = DB::table('AsignacionHorarios')
                ->where('Id', $id)
                ->where('Estado', true)
                ->first();

            if (!$asignacionActual) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró el horario a actualizar'
                ], 404);
            }

            // Validar el empleado
            $empleado = DB::table('Empleados')
                ->where('IdEmpleado', $request->IdEmpleado)
                ->where('Estado', true)
                ->first();

            if (!$empleado) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró el empleado activo'
                ], 404);
            }

            // Validar fechas
            try {
                $fechaInicio = new DateTime($request->FechaInicio);
                $fechaFin = new DateTime($request->FechaFin);

                if ($fechaInicio > $fechaFin) {
                    return response()->json([
                        'success' => false,
                        'message' => 'La fecha de inicio debe ser anterior a la fecha fin'
                    ], 400);
                }
            } catch (Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Formato de fecha inválido'
                ], 400);
            }

            // Validar horarios
            $detalles = [];
            $errores = [];
            
            foreach ($request->detalles as $detalle) {
                // Validar formato de horas
                if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $detalle['HoraInicio']) ||
                    !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $detalle['HoraFin'])) {
                    $errores[] = "Formato de hora inválido para el día {$detalle['DiaSemana']}";
                    continue;
                }

                // Formatear horas
                $horaInicio = str_pad(explode(':', $detalle['HoraInicio'])[0], 2, '0', STR_PAD_LEFT) . ':' . 
                             explode(':', $detalle['HoraInicio'])[1];
                $horaFin = str_pad(explode(':', $detalle['HoraFin'])[0], 2, '0', STR_PAD_LEFT) . ':' . 
                          explode(':', $detalle['HoraFin'])[1];

                $detalles[] = [
                    'DiaSemana' => $detalle['DiaSemana'],
                    'HoraInicio' => $horaInicio,
                    'HoraFin' => $horaFin
                ];
            }

            if (!empty($errores)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Se encontraron errores en los horarios',
                    'errores' => $errores
                ], 400);
            }

            // Obtener el usuario actual
            $userAuth = Auth::user();
            $usuario = DB::table('Usuario')
                ->where(function($query) use ($userAuth) {
                    $query->where('Correo', $userAuth->email)
                          ->orWhere('Correo', strtoupper($userAuth->email))
                          ->orWhere('Correo', strtolower($userAuth->email));
                })
                ->where('estado', true)
                ->first();

            if (!$usuario) {
                Log::warning('No se encontró el usuario en la tabla Usuario, usando valor por defecto');
                $idUsuarioDefault = 1;
                $usuario = (object)['IdUsuario' => $idUsuarioDefault];
            }

            // Desactivar la asignación actual
            DB::table('AsignacionHorarios')
                ->where('Id', $id)
                ->update(['Estado' => false]);

            // Crear nueva asignación
            $idNuevaAsignacion = DB::table('AsignacionHorarios')->insertGetId([
                'IdEmpleado' => $empleado->IdEmpleado,
                'FechaInicio' => $fechaInicio->format('Y-m-d'),
                'FechaFin' => $fechaFin->format('Y-m-d'),
                'FechaCreacion' => now(),
                'CreadoPor' => $usuario->IdUsuario,
                'Estado' => true,
                'TipoHorario' => 1
            ]);

            // Crear nuevos detalles
            foreach ($detalles as $detalle) {
                DB::table('DetalleHorarios')->insert([
                    'IdAsignacion' => $idNuevaAsignacion,
                    'DiaSemana' => $detalle['DiaSemana'],
                    'HoraInicio' => $detalle['HoraInicio'],
                    'HoraFin' => $detalle['HoraFin']
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Horario actualizado exitosamente'
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar horario:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el horario: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            // Verificar que la asignación existe
            $asignacion = DB::table('AsignacionHorarios')
                ->where('Id', $id)
                ->where('Estado', true)
                ->first();

            if (!$asignacion) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró el horario a desactivar'
                ], 404);
            }

            // Desactivar la asignación
            DB::table('AsignacionHorarios')
                ->where('Id', $id)
                ->update(['Estado' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Horario desactivado exitosamente'
            ]);

        } catch (Exception $e) {
            Log::error('Error al desactivar horario:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar el horario: ' . $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="plantilla_horarios.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            
            // Encabezados del CSV
            fputcsv($file, [
                'Documento',
                'FechaInicio',
                'FechaFin',
                'DiaSemana',
                'HoraInicio',
                'HoraFin'
            ]);

            // Ejemplo de datos
            fputcsv($file, [
                '12345678',
                '2024-03-01',
                '2024-03-31',
                '2',
                '07:00',
                '16:00'
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
} 