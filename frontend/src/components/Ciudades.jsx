import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    TablePagination
} from '@mui/material';
import { appIcons, appColors, sweetAlertConfig } from '../utils/theme';
import Swal from 'sweetalert2';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const Ciudades = () => {
    const [ciudades, setCiudades] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
    });

    const perPageOptions = [5, 10, 25, 50, 100];

    const fetchCiudades = async () => {
        try {
            setLoading(true);
            console.log("Iniciando petición de ciudades...");
            const response = await axiosInstance.get('/ciudades', {
                params: {
                    page: pagination.currentPage,
                    perPage: pagination.perPage,
                    search: searchTerm
                }
            });

            console.log("Respuesta del servidor:", response.data);

            if (response.data.success) {
                setCiudades(response.data.data || []);
                setPagination(prev => ({
                    ...prev,
                    currentPage: response.data.current_page,
                    lastPage: response.data.last_page,
                    perPage: response.data.per_page,
                    total: response.data.total
                }));
            } else {
                throw new Error(response.data.message || 'Error al cargar las ciudades');
            }
        } catch (error) {
            console.error('Error al obtener ciudades:', error);
            toast.error(error.message || 'Error al cargar las ciudades');
            setCiudades([]);
            setPagination(prev => ({
                ...prev,
                currentPage: 1,
                lastPage: 1,
                total: 0
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCiudades();
    }, [pagination.currentPage, pagination.perPage, searchTerm]);

    const handleChangePage = (event, newPage) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage + 1
        }));
    };

    const handleChangeRowsPerPage = (event) => {
        setPagination(prev => ({
            ...prev,
            perPage: parseInt(event.target.value, 10),
            currentPage: 1
        }));
    };

    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                ...sweetAlertConfig,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const response = await axiosInstance.delete(`/ciudades/${id}`);
                if (response.data.success) {
                    toast.success('Ciudad eliminada exitosamente');
                    fetchCiudades();
                }
            }
        } catch (error) {
            console.error('Error al eliminar ciudad:', error);
            toast.error('Error al eliminar la ciudad');
        }
    };

    const handleEdit = async (ciudad) => {
        try {
            const { value: nombre } = await Swal.fire({
                title: 'Editar Ciudad',
                input: 'text',
                inputLabel: 'Nombre de la ciudad',
                inputValue: ciudad.nombre,
                showCancelButton: true,
                ...sweetAlertConfig,
                inputValidator: (value) => {
                    if (!value) {
                        return 'Debe ingresar un nombre';
                    }
                }
            });

            if (nombre) {
                const response = await axiosInstance.put(`/ciudades/${ciudad.id}`, {
                    nombre,
                    estado: ciudad.estado
                });

                if (response.data.success) {
                    toast.success('Ciudad actualizada exitosamente');
                    fetchCiudades();
                }
            }
        } catch (error) {
            console.error('Error al actualizar ciudad:', error);
            toast.error('Error al actualizar la ciudad');
        }
    };

    const handleAdd = async () => {
        try {
            const { value: nombre } = await Swal.fire({
                title: 'Nueva Ciudad',
                input: 'text',
                inputLabel: 'Nombre de la ciudad',
                showCancelButton: true,
                ...sweetAlertConfig,
                inputValidator: (value) => {
                    if (!value) {
                        return 'Debe ingresar un nombre';
                    }
                }
            });

            if (nombre) {
                const response = await axiosInstance.post('/ciudades', {
                    nombre
                });

                if (response.data.success) {
                    toast.success('Ciudad creada exitosamente');
                    fetchCiudades();
                }
            }
        } catch (error) {
            console.error('Error al crear ciudad:', error);
            toast.error('Error al crear la ciudad');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Ciudades</h2>
                <Button
                    variant="contained"
                    onClick={handleAdd}
                    style={{ backgroundColor: appColors.primary }}
                    startIcon={<appIcons.add />}
                >
                    Nueva Ciudad
                </Button>
            </div>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <appIcons.search />
                        </InputAdornment>
                    ),
                }}
            />

            <TableContainer component={Paper} className="shadow-md">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>NOMBRE</TableCell>
                            <TableCell>ESTADO</TableCell>
                            <TableCell align="right">ACCIONES</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <FaSpinner className="animate-spin text-4xl text-vml-red mb-2" />
                                        <p>Cargando...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : ciudades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No se encontraron ciudades
                                </TableCell>
                            </TableRow>
                        ) : (
                            ciudades.map((ciudad) => (
                                <TableRow key={ciudad.id || `temp-${Math.random()}`}>
                                    <TableCell>{ciudad.nombre}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                ciudad.estado === "1"
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {ciudad.estado === "1" ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleEdit(ciudad)}
                                            style={{ color: appColors.info }}
                                        >
                                            <appIcons.edit />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(ciudad.id)}
                                            style={{ color: appColors.error }}
                                        >
                                            <appIcons.delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={pagination.currentPage - 1}
                    onPageChange={handleChangePage}
                    rowsPerPage={pagination.perPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={perPageOptions}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                />
            </TableContainer>
        </div>
    );
};

export default Ciudades; 