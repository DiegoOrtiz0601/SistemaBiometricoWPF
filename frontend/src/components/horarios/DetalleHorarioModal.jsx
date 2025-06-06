import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';


const diasSemana = [
    { id: 1, nombre: 'Domingo' },
    { id: 2, nombre: 'Lunes' },
    { id: 3, nombre: 'Martes' },
    { id: 4, nombre: 'Miércoles' },
    { id: 5, nombre: 'Jueves' },
    { id: 6, nombre: 'Viernes' },
    { id: 7, nombre: 'Sábado' }
];

const DetalleHorarioModal = ({ horario, onClose }) => {
    const [detalles, setDetalles] = useState([]);

    useEffect(() => {
        if (horario?.detalles) {
            console.log('Horario recibido:', horario);
            console.log('Detalles recibidos:', horario.detalles);
            
            // Mapear los detalles con los nombres de los días
            const detallesConDias = horario.detalles.map(detalle => {
                const idDia = parseInt(detalle.id_dia_semana || detalle.DiaSemana);
                console.log('ID del día a buscar:', idDia);
                
                const dia = diasSemana.find(d => d.id === idDia);
                console.log('Día encontrado:', dia);

                return {
                    ...detalle,
                    DiaSemana: idDia,
                    HoraInicio: detalle.hora_inicio || detalle.HoraInicio,
                    HoraFin: detalle.hora_fin || detalle.HoraFin,
                    nombreDia: dia ? dia.nombre : `Día no especificado (ID: ${idDia})`
                };
            });
            
            console.log('Detalles procesados:', detallesConDias);
            setDetalles(detallesConDias);
        }
    }, [horario]);

    const formatTime = (time) => {
        if (!time) return '';
        try {
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours));
            date.setMinutes(parseInt(minutes));
            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error al formatear hora:', error);
            return time;
        }
    };

    if (!horario) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div 
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative my-8 max-h-[90vh] overflow-y-auto"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Detalles del Horario</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <RiCloseLine className="text-2xl" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Información del empleado */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-vml-red rounded-full mr-2"></span>
                            Datos del Empleado
                        </h3>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-600">Nombre:</dt>
                                <dd className="text-gray-800 font-medium">{horario.empleado?.nombre_completo}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-600">Documento:</dt>
                                <dd className="text-gray-800 font-medium">{horario.empleado?.documento}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-600">Empresa:</dt>
                                <dd className="text-gray-800 font-medium">{horario.empleado?.empresa}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-600">Tipo:</dt>
                                <dd className="text-gray-800 font-medium">{horario.empleado?.tipo_empleado}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Información del horario */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-vml-red rounded-full mr-2"></span>
                            Datos del Horario
                        </h3>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-600">Fecha Inicio:</dt>
                                <dd className="text-gray-800 font-medium">
                                    {new Date(horario.fecha_inicio).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-600">Fecha Fin:</dt>
                                <dd className="text-gray-800 font-medium">
                                    {new Date(horario.fecha_fin).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-600">Tipo de Horario:</dt>
                                <dd className="text-gray-800 font-medium">
                                    {horario.tipo_horario === 1 ? 'ENROLADO NO MARCA' : 'ENROLADO ROTATIVO'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-600">Estado:</dt>
                                <dd className="text-gray-800 font-medium">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        horario.estado === "1" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {horario.estado === "1" ? 'Activo' : 'Inactivo'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Detalles de los horarios por día */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-vml-red rounded-full mr-2"></span>
                            Horarios por Día
                        </h3>
                        {detalles.length === 0 ? (
                            <p className="text-gray-600 text-center py-4">No hay horarios configurados</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {detalles.map((detalle) => (
                                    <div 
                                        key={detalle.DiaSemana} 
                                        className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <h4 className="font-medium text-gray-800 mb-2 pb-2 border-b border-gray-100">
                                            {detalle.nombreDia}
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Entrada:</span>
                                                <span className="font-medium">{formatTime(detalle.HoraInicio)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Salida:</span>
                                                <span className="font-medium">{formatTime(detalle.HoraFin)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DetalleHorarioModal; 