import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiAddLine, RiSearchLine, RiEditLine, RiDeleteBin6Line, RiArrowUpSLine, RiArrowDownSLine, RiEyeLine, RiCloseLine, RiUploadLine } from 'react-icons/ri';
import { FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../utils/axiosConfig';
import HorarioForm from './HorarioForm';
import DetalleHorarioModal from './DetalleHorarioModal';
import CargaMasivaHorarios from './CargaMasivaHorarios';
import { LoadingOverlay, TableLoadingRow, EmptyRow, LoadingButton } from '../common/LoadingStates';
import { debounce } from 'lodash';

const LoadingSpinner = () => (
    <FaSpinner className="animate-spin text-4xl text-vml-red" />
);

const Horarios = () => {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showCargaMasiva, setShowCargaMasiva] = useState(false);
    const [editingHorario, setEditingHorario] = useState(null);
    const [showDetalle, setShowDetalle] = useState(false);
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
    });

    const perPageOptions = [5, 10, 25, 50, 100];
    const [loadingAction, setLoadingAction] = useState(false);

    const debouncedSearch = useCallback(
        debounce((term) => {
            if (term.length === 0 || term.length >= 3) {
                setSearchTerm(term);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
            }
        }, 800),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
        if (value.length === 0 || value.length >= 3) {
            debouncedSearch(value);
        }
    };

    const fetchHorarios = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/asignacion-horarios', {
                params: {
                    page: pagination.currentPage,
                    perPage: pagination.perPage,
                    search: searchTerm
                }
            });

            if (response.data.success) {
                setHorarios(response.data.data);
                setPagination({
                    currentPage: response.data.pagination.current_page,
                    lastPage: response.data.pagination.last_page,
                    perPage: response.data.pagination.per_page,
                    total: response.data.pagination.total
                });
            } else {
                setHorarios([]);
                setPagination({
                    currentPage: 1,
                    lastPage: 1,
                    perPage: 10,
                    total: 0
                });
            }
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los horarios'
            });
            setHorarios([]);
            setPagination({
                currentPage: 1,
                lastPage: 1,
                perPage: 10,
                total: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHorarios();
    }, [pagination.currentPage, pagination.perPage, searchTerm]);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSubmit = async (formData) => {
        try {
            setLoadingAction(true);
            if (editingHorario) {
                await axiosInstance.put(`/asignacion-horarios/${editingHorario.id}`, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Horario actualizado exitosamente'
                });
            } else {
                await axiosInstance.post('/asignacion-horarios', formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Horario creado exitosamente'
                });
            }
            setShowForm(false);
            setEditingHorario(null);
            fetchHorarios();
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar la solicitud'
            });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                setLoadingAction(true);
                await axiosInstance.delete(`/asignacion-horarios/${id}`);
                Swal.fire(
                    'Eliminado',
                    'El horario ha sido eliminado',
                    'success'
                );
                fetchHorarios();
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el horario'
                });
            } finally {
                setLoadingAction(false);
            }
        }
    };

    const handleEditClick = (horario) => {
        setEditingHorario(horario);
        setShowForm(true);
    };

    const handleVerDetalle = (horario) => {
        setHorarioSeleccionado(horario);
        setShowDetalle(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Asignación de Horarios</h1>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCargaMasiva(true)}
                        className="bg-vml-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                        <RiUploadLine className="text-xl" />
                        Cargar Horarios
                    </motion.button>
                    
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md mb-6 relative">
                {loadingAction && <LoadingOverlay message="Procesando..." />}
                
                <div className="p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <RiSearchLine className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar horarios..."
                            value={localSearchTerm}
                            onChange={handleSearchChange}
                            className="w-full px-3 py-2 border-none focus:outline-none"
                            disabled={loading}
                        />
                        {localSearchTerm !== searchTerm && (
                            <FaSpinner className="animate-spin text-gray-400" />
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empleado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Documento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo Empleado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <TableLoadingRow colSpan={5} />
                            ) : horarios.length === 0 ? (
                                <EmptyRow colSpan={5} message="No se encontraron horarios" />
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {horarios.map((horario) => (
                                        <motion.tr
                                            key={horario.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {horario.empleado.nombre_completo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {horario.empleado.documento}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {horario.empleado.empresa}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {horario.empleado.tipo_empleado}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <LoadingButton
                                                    onClick={() => handleVerDetalle(horario)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-full transition-colors"
                                                    title="Ver detalles"
                                                    loading={loadingAction}
                                                >
                                                    <RiEyeLine className="text-xl" />
                                                </LoadingButton>
                                                <LoadingButton
                                                    onClick={() => handleEditClick(horario)}
                                                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded-full transition-colors"
                                                    title="Editar"
                                                    loading={loadingAction}
                                                >
                                                    <RiEditLine className="text-xl" />
                                                </LoadingButton>
                                                {/* <LoadingButton
                                                    onClick={() => handleDelete(horario.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded-full transition-colors"
                                                    title="Eliminar"
                                                    loading={loadingAction}
                                                >
                                                    <RiDeleteBin6Line className="text-xl" />
                                                </LoadingButton> */}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 flex justify-between items-center border-t">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700">Mostrar</span>
                        <div className="relative">
                            <select
                                className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-vml-red min-w-[80px]"
                                value={pagination.perPage}
                                onChange={(e) => {
                                    const newPerPage = Number(e.target.value);
                                    setPagination(prev => ({
                                        ...prev,
                                        perPage: newPerPage,
                                        currentPage: 1
                                    }));
                                }}
                                disabled={loading}
                            >
                                {perPageOptions.map(option => (
                                    <option key={option} value={option} className="py-1">
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <span className="text-sm text-gray-700">registros por página</span>
                    </div>

                    {pagination.total > 0 && (
                        <>
                            <div className="text-sm text-gray-700">
                                Mostrando {Math.min(((pagination.currentPage - 1) * pagination.perPage) + 1, pagination.total)} a {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de {pagination.total} registros
                            </div>
                            <div className="flex space-x-1">
                                <LoadingButton
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                                    disabled={pagination.currentPage === 1 || loading}
                                    className={`px-3 py-1 rounded ${
                                        pagination.currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                    }`}
                                    loading={loading}
                                >
                                    «
                                </LoadingButton>

                                <LoadingButton
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                                    disabled={pagination.currentPage === 1 || loading}
                                    className={`px-3 py-1 rounded ${
                                        pagination.currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                    }`}
                                    loading={loading}
                                >
                                    ‹
                                </LoadingButton>

                                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                                    .filter(pageNum => {
                                        if (pagination.lastPage <= 7) return true;
                                        if (pageNum === 1 || pageNum === pagination.lastPage) return true;
                                        if (Math.abs(pageNum - pagination.currentPage) <= 1) return true;
                                        return false;
                                    })
                                    .map((pageNum, index, array) => {
                                        if (index > 0 && pageNum - array[index - 1] > 1) {
                                            return (
                                                <span key={`ellipsis-${pageNum}`} className="px-3 py-1">
                                                    ...
                                                </span>
                                            );
                                        }

                                        return (
                                            <LoadingButton
                                                key={pageNum}
                                                onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                                                disabled={loading}
                                                className={`px-3 py-1 rounded ${
                                                    pagination.currentPage === pageNum
                                                        ? 'bg-vml-red text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                                }`}
                                                loading={loading}
                                            >
                                                {pageNum}
                                            </LoadingButton>
                                        );
                                    })}

                                <LoadingButton
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.lastPage, prev.currentPage + 1) }))}
                                    disabled={pagination.currentPage === pagination.lastPage || loading}
                                    className={`px-3 py-1 rounded ${
                                        pagination.currentPage === pagination.lastPage
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                    }`}
                                    loading={loading}
                                >
                                    ›
                                </LoadingButton>

                                <LoadingButton
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.lastPage }))}
                                    disabled={pagination.currentPage === pagination.lastPage || loading}
                                    className={`px-3 py-1 rounded ${
                                        pagination.currentPage === pagination.lastPage
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                    }`}
                                    loading={loading}
                                >
                                    »
                                </LoadingButton>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showForm && (
                    <HorarioForm
                        onSubmit={handleSubmit}
                        onClose={() => {
                            setShowForm(false);
                            setEditingHorario(null);
                            fetchHorarios(); 
                        }}
                        horarioToEdit={editingHorario}
                    />
                )}
                {showDetalle && horarioSeleccionado && (
                    <DetalleHorarioModal
                        horario={horarioSeleccionado}
                        onClose={() => {
                            setShowDetalle(false);
                            setHorarioSeleccionado(null);
                            fetchHorarios(); 
                        }}
                    />
                )}
                {showCargaMasiva && (
                    <CargaMasivaHorarios
                        onClose={() => setShowCargaMasiva(false)}
                        onSuccess={fetchHorarios}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Horarios;
