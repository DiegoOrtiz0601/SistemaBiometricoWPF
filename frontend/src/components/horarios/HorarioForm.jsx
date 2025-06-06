import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';
import axiosInstance from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

const diasSemana = [
    { id: 2, nombre: 'Lunes' },
    { id: 3, nombre: 'Martes' },
    { id: 4, nombre: 'Miércoles' },
    { id: 5, nombre: 'Jueves' },
    { id: 6, nombre: 'Viernes' },
    { id: 7, nombre: 'Sábado' },
    { id: 1, nombre: 'Domingo' }
];

const HorarioForm = ({ onSubmit, onClose, horarioToEdit }) => {
    const [formData, setFormData] = useState({
        IdEmpleado: horarioToEdit?.empleado?.id || '',
        FechaInicio: horarioToEdit?.fecha_inicio || '',
        FechaFin: horarioToEdit?.fecha_fin || '',
        Estado: horarioToEdit?.estado === "1" || true,
        TipoHorario: horarioToEdit?.tipo_horario || ''
    });

    const [loading, setLoading] = useState(false);
    const [tiposHorario, setTiposHorario] = useState([]);
    const [empleadoData, setEmpleadoData] = useState(horarioToEdit?.empleado || null);
    const [detallesHorario, setDetallesHorario] = useState(
        diasSemana.map(dia => ({
            diaSemana: dia.id,
            horaInicio: '',
            horaFin: '',
            activo: false
        }))
    );

    useEffect(() => {
        if (horarioToEdit?.id) {
            setEmpleadoData(horarioToEdit.empleado);
            setFormData(prev => ({
                ...prev,
                IdEmpleado: horarioToEdit.empleado?.id || '',
                FechaInicio: horarioToEdit.fecha_inicio || '',
                FechaFin: horarioToEdit.fecha_fin || '',
                Estado: horarioToEdit.estado === "1",
                TipoHorario: horarioToEdit.tipo_horario || ''
            }));

            // Mapear los detalles existentes a los días de la semana
            const nuevosDetalles = diasSemana.map(dia => {
                const detalleExistente = horarioToEdit.detalles?.find(
                    d => d.dia_semana === dia.id || d.DiaSemana === dia.id
                );

                return {
                    diaSemana: dia.id,
                    horaInicio: detalleExistente ? (detalleExistente.hora_inicio || detalleExistente.HoraInicio) : '',
                    horaFin: detalleExistente ? (detalleExistente.hora_fin || detalleExistente.HoraFin) : '',
                    activo: !!detalleExistente
                };
            });

            setDetallesHorario(nuevosDetalles);
            console.log('Detalles cargados:', nuevosDetalles);
        }
        cargarTiposHorario();
    }, [horarioToEdit]);

    const cargarTiposHorario = async () => {
        try {
            const response = await axiosInstance.get('/empleados/tipos');
            if (response.data.status === 'success') {
                setTiposHorario(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar tipos de horario:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los tipos de horario'
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDiaChange = (index, field, value) => {
        const nuevosDetalles = [...detallesHorario];
        if (field === 'activo') {
            nuevosDetalles[index] = {
                ...nuevosDetalles[index],
                activo: value,
                horaInicio: value ? nuevosDetalles[index].horaInicio || '08:00' : '',
                horaFin: value ? nuevosDetalles[index].horaFin || '17:00' : ''
            };
        } else {
            nuevosDetalles[index] = {
                ...nuevosDetalles[index],
                [field]: value
            };
        }
        setDetallesHorario(nuevosDetalles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar fechas
        const fechaInicio = new Date(formData.FechaInicio);
        const fechaFin = new Date(formData.FechaFin);
        
        if (fechaFin < fechaInicio) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'La fecha de fin no puede ser anterior a la fecha de inicio'
            });
            return;
        }

        // Validar que al menos un día esté configurado
        const detallesActivos = detallesHorario.filter(detalle => detalle.activo);
        if (detallesActivos.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Debe configurar al menos un día de la semana'
            });
            return;
        }

        setLoading(true);
        try {
            let response;
            const datosEnvio = {
                ...formData,
                detalles: detallesActivos.map(detalle => ({
                    DiaSemana: detalle.diaSemana,
                    HoraInicio: detalle.horaInicio,
                    HoraFin: detalle.horaFin
                }))
            };

            console.log('Datos a enviar:', datosEnvio);

            if (horarioToEdit) {
                response = await axiosInstance.put(`/asignacion-horarios/${horarioToEdit.id}`, datosEnvio);
            } else {
                response = await axiosInstance.post('/asignacion-horarios', datosEnvio);
            }

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: horarioToEdit ? 'Horario actualizado exitosamente' : 'Horario creado exitosamente'
                });
                onClose();
            }
        } catch (error) {
            console.error('Error al guardar el horario:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Hubo un error al guardar el horario'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative my-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <RiCloseLine className="text-2xl" />
                </button>

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        {horarioToEdit ? 'Editar Horario' : 'Nuevo Horario'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Panel izquierdo: Datos básicos */}
                            <div className="space-y-4">
                                {empleadoData && (
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h3 className="font-medium text-gray-700 mb-2">Datos del Empleado:</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="font-medium">Nombre:</span>
                                                <p className="text-gray-600">{empleadoData.nombre_completo}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Documento:</span>
                                                <p className="text-gray-600">{empleadoData.documento}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Empresa:</span>
                                                <p className="text-gray-600">{empleadoData.empresa}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Tipo:</span>
                                                <p className="text-gray-600">{empleadoData.tipo_empleado}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-medium">Estado:</span>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                    empleadoData.estado === "1" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {empleadoData.estado === "1" ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha Inicio
                                        </label>
                                        <input
                                            type="date"
                                            name="FechaInicio"
                                            value={formData.FechaInicio}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-vml-red"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha Fin
                                        </label>
                                        <input
                                            type="date"
                                            name="FechaFin"
                                            value={formData.FechaFin}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-vml-red"
                                            required
                                        />
                                    </div>
                                </div>

                              

                                
                            </div>

                            {/* Panel derecho: Configuración de días */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-700 mb-4">Configuración de Horarios por Día</h3>
                                <div className="max-h-[400px] overflow-y-auto pr-2">
                                    <div className="grid grid-cols-1 gap-3">
                                        {detallesHorario.map((detalle, index) => (
                                            <div 
                                                key={diasSemana[index].id} 
                                                className={`bg-white border rounded-lg p-3 transition-all duration-200 ${
                                                    detalle.activo ? 'border-vml-red' : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="font-medium text-gray-700 flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={detalle.activo}
                                                            onChange={(e) => handleDiaChange(index, 'activo', e.target.checked)}
                                                            className="h-4 w-4 text-vml-red focus:ring-vml-red border-gray-300 rounded mr-2"
                                                        />
                                                        {diasSemana[index].nombre}
                                                    </label>
                                                </div>
                                                {detalle.activo && (
                                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Entrada
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={detalle.horaInicio}
                                                                onChange={(e) => handleDiaChange(index, 'horaInicio', e.target.value)}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-vml-red focus:border-vml-red"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Salida
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={detalle.horaFin}
                                                                onChange={(e) => handleDiaChange(index, 'horaFin', e.target.value)}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-vml-red focus:border-vml-red"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-vml-red text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? 'Actualizando...' : 'Actualizar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default HorarioForm; 