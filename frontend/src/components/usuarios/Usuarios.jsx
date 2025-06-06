import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Paper,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip
} from '@mui/material';
import { RiSearchLine, RiEditLine, RiLockPasswordLine } from 'react-icons/ri';
import { AiOutlinePlus } from 'react-icons/ai';
import axiosInstance from '../../utils/axiosConfig';
import { LoadingOverlay, TableLoadingRow, EmptyRow, LoadingButton } from '../common/LoadingStates';
import { appColors } from '../../utils/theme';
import { debounce } from 'lodash';
import Swal from 'sweetalert2';
import UsuarioForm from './UsuarioForm';
import CambiarPasswordForm from './CambiarPasswordForm';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
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
        debouncedSearch(value);
    };

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/usuarios', {
                params: {
                    page: pagination.currentPage,
                    perPage: pagination.perPage,
                    search: searchTerm
                }
            });

            if (response.data.success) {
                setUsuarios(response.data.data || []);
                const paginationData = response.data.pagination || {};
                setPagination({
                    currentPage: paginationData.current_page || 1,
                    lastPage: paginationData.last_page || 1,
                    perPage: paginationData.per_page || 10,
                    total: paginationData.total || 0
                });
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los usuarios'
            });
            setUsuarios([]);
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
        fetchUsuarios();
    }, [pagination.currentPage, pagination.perPage, searchTerm]);

    const handleSubmit = async (formData) => {
        try {
            setLoadingAction(true);
            if (editingUsuario) {
                await axiosInstance.put(`/usuarios/${editingUsuario.IdUsuario}`, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Usuario actualizado exitosamente'
                });
            } else {
                await axiosInstance.post('/usuarios', formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Usuario creado exitosamente'
                });
            }
            setShowForm(false);
            setEditingUsuario(null);
            fetchUsuarios();
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

    const handlePasswordChange = async (formData) => {
        try {
            setLoadingAction(true);
            await axiosInstance.put(`/usuarios/${selectedUsuario.IdUsuario}/password`, formData);
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Contraseña actualizada exitosamente'
            });
            setShowPasswordForm(false);
            setSelectedUsuario(null);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al cambiar la contraseña'
            });
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="bg-vml-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    disabled={loading || loadingAction}
                >
                    <AiOutlinePlus className="text-xl" />
                    Nuevo Usuario
                </motion.button>
            </div>

            <div className="bg-white rounded-lg shadow-md mb-6 relative">
                {loadingAction && <LoadingOverlay />}
                
                <div className="p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <RiSearchLine className="text-gray-400" />
                        <TextField
                            fullWidth
                            placeholder="Buscar usuarios..."
                            value={localSearchTerm}
                            onChange={handleSearchChange}
                            variant="standard"
                            disabled={loading}
                            InputProps={{
                                endAdornment: localSearchTerm !== searchTerm && (
                                    <InputAdornment position="end">
                                        <div className="animate-spin">
                                            ⌛
                                        </div>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Correo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <TableLoadingRow colSpan={4} />
                            ) : usuarios.length === 0 ? (
                                <EmptyRow colSpan={4} message="No se encontraron usuarios" />
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {usuarios.map((usuario) => (
                                        <motion.tr
                                            key={usuario.IdUsuario}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {usuario.Nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {usuario.Correo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    usuario.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {usuario.estado ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Tooltip title="Editar usuario">
                                                    <LoadingButton
                                                        onClick={() => {
                                                            setEditingUsuario(usuario);
                                                            setShowForm(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-full transition-colors"
                                                        loading={loadingAction}
                                                    >
                                                        <RiEditLine className="text-xl" />
                                                    </LoadingButton>
                                                </Tooltip>
                                                <Tooltip title="Cambiar contraseña">
                                                    <LoadingButton
                                                        onClick={() => {
                                                            setSelectedUsuario(usuario);
                                                            setShowPasswordForm(true);
                                                        }}
                                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded-full transition-colors"
                                                        loading={loadingAction}
                                                    >
                                                        <RiLockPasswordLine className="text-xl" />
                                                    </LoadingButton>
                                                </Tooltip>
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
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
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
                    <UsuarioForm
                        onSubmit={handleSubmit}
                        onClose={() => {
                            setShowForm(false);
                            setEditingUsuario(null);
                        }}
                        usuarioToEdit={editingUsuario}
                    />
                )}
                {showPasswordForm && selectedUsuario && (
                    <CambiarPasswordForm
                        onSubmit={handlePasswordChange}
                        onClose={() => {
                            setShowPasswordForm(false);
                            setSelectedUsuario(null);
                        }}
                        usuario={selectedUsuario}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Usuarios; 