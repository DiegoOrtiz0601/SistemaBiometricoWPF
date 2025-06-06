<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReporteEmpresa extends Mailable
{
    use Queueable, SerializesModels;

    protected $reportePath;

    public function __construct($reportePath)
    {
        $this->reportePath = $reportePath;
    }

    public function build()
    {
        return $this->view('emails.reporte-empresa')
                    ->subject('Reporte de Asistencia')
                    ->attach($this->reportePath, [
                        'as' => 'ReporteAsistencia.xlsx',
                        'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    ]);
    }
} 