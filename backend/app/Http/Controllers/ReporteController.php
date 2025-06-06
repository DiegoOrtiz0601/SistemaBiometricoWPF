<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReporteEmpresa;

class ReporteController extends Controller
{
    public function reporteEmpresa(Request $request)
    {
        try {
            $fechaInicio = $request->input('fechaInicio');
            $fechaFin = $request->input('fechaFin');
            $idEmpresa = $request->input('idEmpresa');
            $idSede = $request->input('idSede');
            $idCiudad = $request->input('idCiudad');
            $idArea = $request->input('idArea');
            $documento = $request->input('documento');

            // Validar los parámetros requeridos
            if (!$fechaInicio || !$fechaFin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Las fechas de inicio y fin son requeridas'
                ], 400);
            }

            // Validar y formatear las fechas
            try {
                $fechaInicio = date('Y-m-d', strtotime($fechaInicio));
                $fechaFin = date('Y-m-d', strtotime($fechaFin));
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'El formato de las fechas debe ser YYYY-MM-DD'
                ], 400);
            }

            // Validar que las fechas sean válidas
            if (!$fechaInicio || !$fechaFin || $fechaInicio > $fechaFin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Las fechas proporcionadas no son válidas o la fecha de inicio es posterior a la fecha fin'
                ], 400);
            }

            // Construir la consulta base
            $query = DB::table('Empleados as e')
                ->join('Marcaciones as m', 'e.IdEmpleado', '=', 'm.IdEmpleado')
                ->join('Empresa as emp', 'e.IdEmpresa', '=', 'emp.IdEmpresa')
                ->join('Sede as s', 'e.IdSede', '=', 's.IdSede')
                ->join('Ciudad as c', 's.IdCiudad', '=', 'c.IdCiudad')
                ->join('Areas as a', 'e.IdArea', '=', 'a.IdArea')
                ->leftJoin('AsignacionHorarios as ah', function($join) {
                    $join->on('e.IdEmpleado', '=', 'ah.IdEmpleado')
                        ->whereRaw('CONVERT(DATE, m.FechaHora) BETWEEN ah.FechaInicio AND ah.FechaFin')
                        ->where('ah.Estado', '=', true);
                })
                ->leftJoin('DetalleHorarios as dh', function($join) {
                    $join->on('ah.Id', '=', 'dh.IdAsignacion')
                        ->whereRaw('dh.DiaSemana = DATEPART(WEEKDAY, m.FechaHora)');
                })
                ->select(
                    'e.Documento',
                    DB::raw("CONCAT(e.Nombres, ' ', e.Apellidos) as NombreCompleto"),
                    DB::raw('CONVERT(DATE, m.FechaHora) as Fecha'),
                    DB::raw('DATEPART(WEEK, m.FechaHora) as Semana'),
                    DB::raw('CONVERT(VARCHAR(8), dh.HoraInicio, 108) as HoraEntradaEsperada'),
                    DB::raw('CONVERT(VARCHAR(8), dh.HoraFin, 108) as HoraSalidaEsperada'),
                    DB::raw('MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN CONVERT(VARCHAR(8), m.FechaHora, 108) END) as HoraEntrada'),
                    DB::raw('MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN CONVERT(VARCHAR(8), m.FechaHora, 108) END) as HoraSalida'),
                    DB::raw("CASE 
                        WHEN MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END) IS NULL 
                        OR MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END) IS NULL 
                        OR dh.HoraInicio IS NULL 
                        OR dh.HoraFin IS NULL
                        THEN NULL
                        ELSE (
                            -- Minutos tarde en la entrada (si llegó después de la hora de inicio)
                            CASE 
                                WHEN CONVERT(TIME, MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END)) > dh.HoraInicio 
                                THEN DATEDIFF(MINUTE, 
                                    CAST(CONVERT(DATE, m.FechaHora) AS DATETIME) + CAST(dh.HoraInicio AS DATETIME),
                                    MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END)
                                )
                                ELSE 0
                            END +
                            -- Minutos temprano en la salida (si salió antes de la hora fin)
                            CASE 
                                WHEN CONVERT(TIME, MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END)) < dh.HoraFin
                                THEN DATEDIFF(MINUTE,
                                    MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END),
                                    CAST(CONVERT(DATE, m.FechaHora) AS DATETIME) + CAST(dh.HoraFin AS DATETIME)
                                )
                                ELSE 0
                            END
                        )
                    END as MinutosTarde"),
                    DB::raw("CASE 
                        WHEN MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END) IS NULL THEN 'No Marcó'
                        WHEN CONVERT(TIME, MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END)) <= dh.HoraInicio THEN 'A tiempo'
                        ELSE 'Tarde'
                    END as EstadoEntrada"),
                    DB::raw("CASE 
                        WHEN MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END) IS NULL THEN 'No Marcó'
                        WHEN CONVERT(TIME, MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END)) >= dh.HoraFin THEN 'A tiempo'
                        ELSE 'Temprano'
                    END as EstadoSalida"),
                    DB::raw("CASE 
                        WHEN MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END) IS NULL 
                        OR MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END) IS NULL 
                        THEN 'No disponible'
                        ELSE CONCAT(
                            CAST(DATEDIFF(MINUTE, 
                                MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END),
                                MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END)
                            ) / 60 AS VARCHAR), 
                            'h ',
                            CAST(DATEDIFF(MINUTE, 
                                MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END),
                                MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END)
                            ) % 60 AS VARCHAR),
                            'm'
                        )
                    END as LapsoTiempo"),
                    DB::raw("CASE 
                        WHEN MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END) IS NULL 
                        AND MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END) IS NULL 
                        THEN 'Sin Marcaciones'
                        WHEN MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END) IS NULL 
                        THEN 'Falta Entrada'
                        WHEN MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END) IS NULL 
                        THEN 'Falta Salida'
                        ELSE 'Completo'
                    END as EstadoMarcacion"),
                    DB::raw("CASE 
                        WHEN MIN(CASE WHEN m.IdTipoMarcacion = 1 THEN m.FechaHora END) IS NULL 
                        OR MAX(CASE WHEN m.IdTipoMarcacion = 2 THEN m.FechaHora END) IS NULL 
                        THEN 'warning'
                        ELSE 'success'
                    END as EstadoMarcacionTipo"),
                    'emp.Nombre as EmpresaMarcacion',
                    DB::raw("CONCAT(s.Nombre, ' - ', c.Nombre) as SedeMarcacion")
                )
                ->where('m.FechaHora', '>=', $fechaInicio . ' 00:00:00')
                ->where('m.FechaHora', '<=', $fechaFin . ' 23:59:59');

            // Aplicar filtros adicionales si se proporcionan
            if ($idEmpresa) {
                $query->where('e.IdEmpresa', $idEmpresa);
            }
            if ($idSede) {
                $query->where('e.IdSede', $idSede);
            }
            if ($idCiudad) {
                $query->where('c.IdCiudad', $idCiudad);
            }
            if ($idArea) {
                $query->where('e.IdArea', $idArea);
            }
            if ($documento) {
                $query->where('e.Documento', 'like', '%' . $documento . '%');
            }

            // Agrupar y ordenar resultados
            $reporte = $query
                ->groupBy(
                    'e.Documento',
                    'e.Nombres',
                    'e.Apellidos',
                    'emp.Nombre',
                    's.Nombre',
                    'c.Nombre',
                    'a.Nombre',
                    DB::raw('CONVERT(DATE, m.FechaHora)'),
                    DB::raw('DATEPART(WEEK, m.FechaHora)'),
                    'dh.HoraInicio',
                    'dh.HoraFin'
                )
                ->orderBy('e.Nombres')
                ->orderBy('e.Apellidos')
                ->orderBy('Fecha')
                ->get();

            // Procesar los resultados para calcular estadísticas adicionales
            $reporte = $reporte->map(function($registro) {
                $registro->HoraEntrada = $registro->HoraEntrada ? date('H:i:s', strtotime($registro->HoraEntrada)) : null;
                $registro->HoraSalida = $registro->HoraSalida ? date('H:i:s', strtotime($registro->HoraSalida)) : null;
                $registro->Fecha = date('Y-m-d', strtotime($registro->Fecha));

                // Agregar clases CSS para los estados
                $registro->EstadoEntradaClase = match($registro->EstadoEntrada) {
                    'No Marcó' => 'text-yellow-500 font-bold',
                    'A tiempo' => 'text-green-500',
                    'Tarde' => 'text-red-500',
                    default => ''
                };

                $registro->EstadoSalidaClase = match($registro->EstadoSalida) {
                    'No Marcó' => 'text-yellow-500 font-bold',
                    'A tiempo' => 'text-green-500',
                    'Temprano' => 'text-red-500',
                    default => ''
                };

                $registro->EstadoMarcacionClase = match($registro->EstadoMarcacion) {
                    'Sin Marcaciones', 'Falta Entrada', 'Falta Salida' => 'text-yellow-500 font-bold',
                    'Completo' => 'text-green-500',
                    default => ''
                };

                // Formatear MinutosTarde
                if ($registro->MinutosTarde === null) {
                    $registro->MinutosTardeFormateado = 'No disponible';
                    $registro->MinutosTardeClase = 'text-yellow-500 font-bold';
                } else {
                    $horas = floor($registro->MinutosTarde / 60);
                    $minutos = $registro->MinutosTarde % 60;
                    $registro->MinutosTardeFormateado = $registro->MinutosTarde > 0 
                        ? sprintf('%dh %dm', $horas, $minutos)
                        : '0m';
                    $registro->MinutosTardeClase = $registro->MinutosTarde > 0 
                        ? 'text-red-500' 
                        : 'text-green-500';
                }

                return $registro;
            });

            return response()->json([
                'success' => true,
                'data' => $reporte
            ]);

        } catch (\Exception $e) {
            Log::error('Error en ReporteController@reporteEmpresa: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar el reporte',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function exportarExcel(Request $request)
    {
        try {
            // Asegurarnos de que el directorio temporal existe
            $tempDir = storage_path('app/temp');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $reporte = $this->reporteEmpresa($request)->getData();

            if (!$reporte->success) {
                throw new \Exception($reporte->message);
            }

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Encabezados con estilos
            $headers = [
                'A1' => 'Documento',
                'B1' => 'Nombre Completo',
                'C1' => 'Fecha',
                'D1' => 'Semana',
                'E1' => 'Hora Entrada Esperada',
                'F1' => 'Hora Salida Esperada',
                'G1' => 'Hora Entrada',
                'H1' => 'Hora Salida',
                'I1' => 'Minutos Tarde',
                'J1' => 'Estado Entrada',
                'K1' => 'Estado Salida',
                'L1' => 'Lapso de Tiempo',
                'M1' => 'Estado Marcación',
                'N1' => 'Empresa Marcación',
                'O1' => 'Sede Marcación'
            ];

            foreach ($headers as $cell => $value) {
                $sheet->setCellValue($cell, $value);
                $sheet->getStyle($cell)->getFont()->setBold(true);
                $sheet->getStyle($cell)->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('E0E0E0');
            }

            // Datos
            $row = 2;
            foreach ($reporte->data as $item) {
                $sheet->setCellValue('A' . $row, $item->Documento);
                $sheet->setCellValue('B' . $row, $item->NombreCompleto);
                $sheet->setCellValue('C' . $row, $item->Fecha);
                $sheet->setCellValue('D' . $row, $item->Semana);
                $sheet->setCellValue('E' . $row, $item->HoraEntradaEsperada);
                $sheet->setCellValue('F' . $row, $item->HoraSalidaEsperada);
                $sheet->setCellValue('G' . $row, $item->HoraEntrada);
                $sheet->setCellValue('H' . $row, $item->HoraSalida);
                $sheet->setCellValue('I' . $row, $item->MinutosTardeFormateado);
                $sheet->setCellValue('J' . $row, $item->EstadoEntrada);
                $sheet->setCellValue('K' . $row, $item->EstadoSalida);
                $sheet->setCellValue('L' . $row, $item->LapsoTiempo);
                $sheet->setCellValue('M' . $row, $item->EstadoMarcacion);
                $sheet->setCellValue('N' . $row, $item->EmpresaMarcacion);
                $sheet->setCellValue('O' . $row, $item->SedeMarcacion);

                // Aplicar colores según el estado
                if ($item->EstadoEntrada === 'Tarde') {
                    $sheet->getStyle('J' . $row)->getFont()->getColor()->setRGB('FF0000');
                }
                if ($item->EstadoSalida === 'Temprano') {
                    $sheet->getStyle('K' . $row)->getFont()->getColor()->setRGB('FF0000');
                }
                if ($item->EstadoMarcacion !== 'Completo') {
                    $sheet->getStyle('M' . $row)->getFont()->getColor()->setRGB('FF0000');
                }

                $row++;
            }

            // Autoajustar columnas
            foreach (range('A', 'O') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            $writer = new Xlsx($spreadsheet);
            $filename = 'ReporteAsistencia_' . date('Y-m-d_H-i-s') . '.xlsx';
            $filePath = $tempDir . '/' . $filename;
            
            // Guardar el archivo temporalmente
            $writer->save($filePath);

            // Leer el archivo y devolverlo como respuesta
            $content = file_get_contents($filePath);
            unlink($filePath); // Eliminar el archivo temporal

            return response($content)
                ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Length', strlen($content))
                ->header('Access-Control-Expose-Headers', 'Content-Disposition');

        } catch (\Exception $e) {
            Log::error('Error en exportación Excel: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar el reporte: ' . $e->getMessage()
            ], 500);
        }
    }

    public function enviarCorreo(Request $request)
    {
        try {
            $reporte = $this->reporteEmpresa($request)->getData();

            if (!$reporte->success) {
                throw new \Exception($reporte->message);
            }

            // Generar Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // ... (mismo código de generación de Excel que en exportarExcel)

            $filename = 'ReporteAsistencia_' . date('Y-m-d_H-i-s') . '.xlsx';
            $path = storage_path('app/temp/' . $filename);

            $writer = new Xlsx($spreadsheet);
            $writer->save($path);

            // Enviar correo
            Mail::to($request->user()->email)->send(new ReporteEmpresa($path));

            // Eliminar archivo temporal
            unlink($path);

            return response()->json([
                'success' => true,
                'message' => 'Reporte enviado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar el reporte: ' . $e->getMessage()
            ], 500);
        }
    }
}
