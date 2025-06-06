import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Chip,
    Box
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { RiFileExcel2Line, RiMailSendLine, RiSearchLine, RiFilterLine, RiCloseLine } from 'react-icons/ri';
import { MdExpandMore } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import { LoadingOverlay } from '../common/LoadingStates';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { toast } from 'react-hot-toast';

dayjs.locale('es');

const ReporteEmpresa = () => {
    const [filtros, setFiltros] = useState({
        fechaInicio: dayjs(),
        fechaFin: dayjs(),
        idEmpresa: '',
        idSede: '',
        idCiudad: '',
        idArea: '',
        documento: ''
    });

    const [empresas, setEmpresas] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [reporte, setReporte] = useState([]);
    const [filtrosAplicados, setFiltrosAplicados] = useState([]);
    const [loadingExport, setLoadingExport] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const perPageOptions = [5, 10, 25, 50, 100];

    useEffect(() => {
        cargarCatalogos();
    }, []);

    const cargarCatalogos = async () => {
        try {
            setLoadingData(true);
            const [empresasRes, ciudadesRes] = await Promise.all([
                axiosInstance.get('/empresas/activas'),
                axiosInstance.get('/ciudades/activas')
            ]);

            if (empresasRes.data.success) setEmpresas(empresasRes.data.data);
            if (ciudadesRes.data.success) setCiudades(ciudadesRes.data.data);
        } catch (error) {
            console.error('Error al cargar catálogos:', error);
            toast.error('No se pudieron cargar los datos necesarios');
        } finally {
            setLoadingData(false);
        }
    };

    const cargarSedes = async (idEmpresa) => {
        if (!idEmpresa) {
            setSedes([]);
            return;
        }
        try {
            const response = await axiosInstance.get(`/sedes/empresa/${idEmpresa}`);
            if (response.data.success) {
                setSedes(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar sedes:', error);
            toast.error('Error al cargar las sedes');
        }
    };

    const cargarAreas = async (idSede) => {
        if (!idSede) {
            setAreas([]);
            return;
        }
        try {
            const response = await axiosInstance.get(`/areas/sede/${idSede}`);
            if (response.data.success) {
                setAreas(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar áreas:', error);
            toast.error('Error al cargar las áreas');
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => {
            const nuevosFiltros = { ...prev, [campo]: valor };
            
            // Si el campo es documento y tiene valor, limpiar y bloquear los selectores
            if (campo === 'documento' && valor) {
                nuevosFiltros.idEmpresa = '';
                nuevosFiltros.idSede = '';
                nuevosFiltros.idCiudad = '';
                nuevosFiltros.idArea = '';
                setSedes([]);
                setAreas([]);
            }
            
            // Resetear campos dependientes
            if (campo === 'idEmpresa') {
                nuevosFiltros.idSede = '';
                nuevosFiltros.idArea = '';
                if (valor) cargarSedes(valor);
                // Limpiar documento si se selecciona empresa
                nuevosFiltros.documento = '';
            } else if (campo === 'idSede') {
                nuevosFiltros.idArea = '';
                if (valor) cargarAreas(valor);
                // Limpiar documento si se selecciona sede
                nuevosFiltros.documento = '';
            } else if (['idCiudad', 'idArea'].includes(campo)) {
                // Limpiar documento si se selecciona ciudad o área
                nuevosFiltros.documento = '';
            }
            
            return nuevosFiltros;
        });
    };

    const generarReporte = async () => {
        if (!filtros.fechaInicio || !filtros.fechaFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor seleccione un rango de fechas'
            });
            return;
        }

        // Validar que si hay documento, no haya otros filtros seleccionados
        if (filtros.documento && (filtros.idEmpresa || filtros.idSede || filtros.idCiudad || filtros.idArea)) {
            Swal.fire({
                icon: 'warning',
                title: 'Filtros incompatibles',
                text: 'Al buscar por documento, no se pueden usar otros filtros'
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.get('/reportes/empresa', {
                params: {
                    fechaInicio: filtros.fechaInicio.format('YYYY-MM-DD'),
                    fechaFin: filtros.fechaFin.format('YYYY-MM-DD'),
                    idEmpresa: filtros.idEmpresa || undefined,
                    idSede: filtros.idSede || undefined,
                    idCiudad: filtros.idCiudad || undefined,
                    idArea: filtros.idArea || undefined,
                    documento: filtros.documento || undefined
                }
            });

            if (response.data.success) {
                // Formatear los datos para mostrar correctamente
                const datosFormateados = response.data.data.map(registro => ({
                    ...registro,
                    EmpresaMarcacion: registro.EmpresaMarcacion || 'No disponible',
                    SedeMarcacion: registro.SedeMarcacion || 'No disponible'
                }));
                setReporte(datosFormateados);
                actualizarFiltrosAplicados();
            }
        } catch (error) {
            console.error('Error al generar reporte:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo generar el reporte'
            });
        } finally {
            setLoading(false);
        }
    };

    const actualizarFiltrosAplicados = () => {
        const filtrosActivos = [];
        if (filtros.fechaInicio && filtros.fechaFin) {
            filtrosActivos.push(`${filtros.fechaInicio.format('DD/MM/YYYY')} - ${filtros.fechaFin.format('DD/MM/YYYY')}`);
        }
        if (filtros.documento) filtrosActivos.push(`Documento: ${filtros.documento}`);
        if (filtros.idEmpresa) {
            const empresa = empresas.find(e => e.id === filtros.idEmpresa);
            if (empresa) filtrosActivos.push(`Empresa: ${empresa.nombre}`);
        }
        if (filtros.idSede) {
            const sede = sedes.find(s => s.IdSede === filtros.idSede);
            if (sede) filtrosActivos.push(`Sede: ${sede.Nombre}`);
        }
        if (filtros.idCiudad) {
            const ciudad = ciudades.find(c => c.id === filtros.idCiudad);
            if (ciudad) filtrosActivos.push(`Ciudad: ${ciudad.nombre}`);
        }
        if (filtros.idArea) {
            const area = areas.find(a => a.id === filtros.idArea);
            if (area) filtrosActivos.push(`Área: ${area.nombre}`);
        }
        setFiltrosAplicados(filtrosActivos);
    };

    const limpiarFiltros = () => {
        setFiltros({
            fechaInicio: dayjs(),
            fechaFin: dayjs(),
            idEmpresa: '',
            idSede: '',
            idCiudad: '',
            idArea: '',
            documento: ''
        });
        setSedes([]);
        setAreas([]);
        setReporte([]);
        setFiltrosAplicados([]);
    };

    const exportarExcel = async () => {
        try {
            setLoadingExport(true);
            const response = await axiosInstance.get('/reportes/empresa/excel', {
                params: {
                    fechaInicio: filtros.fechaInicio.format('YYYY-MM-DD'),
                    fechaFin: filtros.fechaFin.format('YYYY-MM-DD'),
                    idEmpresa: filtros.idEmpresa || undefined,
                    idSede: filtros.idSede || undefined,
                    idCiudad: filtros.idCiudad || undefined,
                    idArea: filtros.idArea || undefined,
                    documento: filtros.documento || undefined
                },
                responseType: 'blob'
            });

            // Crear URL del blob
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            // Obtener el nombre del archivo del header
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `ReporteAsistencia_${filtros.fechaInicio.format('YYYY-MM-DD')}_${filtros.fechaFin.format('YYYY-MM-DD')}.xlsx`;

            // Crear link y simular clic
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error al exportar:', error);
            toast.error('Error al exportar el reporte');
        } finally {
            setLoadingExport(false);
        }
    };

    const enviarCorreo = async () => {
        try {
            setLoadingExport(true);
            await axiosInstance.post('/reportes/empresa/enviar-correo', {
                fechaInicio: filtros.fechaInicio.format('YYYY-MM-DD'),
                fechaFin: filtros.fechaFin.format('YYYY-MM-DD'),
                idEmpresa: filtros.idEmpresa || undefined,
                idSede: filtros.idSede || undefined,
                idCiudad: filtros.idCiudad || undefined,
                idArea: filtros.idArea || undefined,
                documento: filtros.documento || undefined
            });

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'El reporte ha sido enviado por correo'
            });
        } catch (error) {
            console.error('Error al enviar correo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo enviar el reporte por correo'
            });
        } finally {
            setLoadingExport(false);
        }
    };

    const eliminarFiltro = (filtro) => {
        const [tipo, valor] = filtro.split(': ');
        let nuevosFiltros = { ...filtros };

        switch (tipo) {
            case 'Documento':
                nuevosFiltros.documento = '';
                break;
            case 'Empresa':
                nuevosFiltros.idEmpresa = '';
                nuevosFiltros.idSede = '';
                nuevosFiltros.idArea = '';
                setSedes([]);
                setAreas([]);
                break;
            case 'Ciudad':
                nuevosFiltros.idCiudad = '';
                break;
            case 'Sede':
                nuevosFiltros.idSede = '';
                nuevosFiltros.idArea = '';
                setAreas([]);
                break;
            case 'Área':
                nuevosFiltros.idArea = '';
                break;
            default:
                // Si es un rango de fechas, resetear a la fecha actual
                if (filtro.includes('-')) {
                    nuevosFiltros.fechaInicio = dayjs();
                    nuevosFiltros.fechaFin = dayjs();
                }
                break;
        }

        setFiltros(nuevosFiltros);
        // Generar el reporte con los nuevos filtros
        generarReporte();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="p-6">
                <Typography variant="h4" className="mb-6">
                    Reporte de Asistencia
                </Typography>

                <Paper className="mb-6">
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<MdExpandMore />}
                            className="bg-gray-50"
                        >
                            <div className="flex items-center gap-2">
                                <RiSearchLine className="text-xl" />
                                <Typography>Campos de Búsqueda</Typography>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={3} className="p-4">
                                <Grid item xs={12} md={6} lg={3}>
                                    <DatePicker
                                        label="Fecha Inicio"
                                        value={filtros.fechaInicio}
                                        onChange={(newValue) => handleFiltroChange('fechaInicio', newValue)}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: 'outlined',
                                                size: 'medium',
                                                error: false
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <DatePicker
                                        label="Fecha Fin"
                                        value={filtros.fechaFin}
                                        onChange={(newValue) => handleFiltroChange('fechaFin', newValue)}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: 'outlined',
                                                size: 'medium',
                                                error: false
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <TextField
                                        label="Documento"
                                        value={filtros.documento}
                                        onChange={(e) => handleFiltroChange('documento', e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                        size="medium"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <FormControl fullWidth variant="outlined" size="medium">
                                        <InputLabel>Empresa</InputLabel>
                                        <Select
                                            value={filtros.idEmpresa}
                                            onChange={(e) => handleFiltroChange('idEmpresa', e.target.value)}
                                            label="Empresa"
                                            disabled={!!filtros.documento}
                                        >
                                            <MenuItem value="">
                                                <em>Todas</em>
                                            </MenuItem>
                                            {empresas.map((empresa) => (
                                                <MenuItem key={empresa.id} value={empresa.id}>
                                                    {empresa.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <FormControl fullWidth variant="outlined" size="medium">
                                        <InputLabel>Ciudad</InputLabel>
                                        <Select
                                            value={filtros.idCiudad}
                                            onChange={(e) => handleFiltroChange('idCiudad', e.target.value)}
                                            label="Ciudad"
                                            disabled={!!filtros.documento}
                                        >
                                            <MenuItem value="">
                                                <em>Todas</em>
                                            </MenuItem>
                                            {ciudades.map((ciudad) => (
                                                <MenuItem key={ciudad.id} value={ciudad.id}>
                                                    {ciudad.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <FormControl fullWidth variant="outlined" size="medium">
                                        <InputLabel>Sede</InputLabel>
                                        <Select
                                            value={filtros.idSede}
                                            onChange={(e) => handleFiltroChange('idSede', e.target.value)}
                                            label="Sede"
                                            disabled={!filtros.idEmpresa || !!filtros.documento}
                                        >
                                            <MenuItem value="">
                                                <em>Todas</em>
                                            </MenuItem>
                                            {sedes.map((sede) => (
                                                <MenuItem key={sede.IdSede} value={sede.IdSede}>
                                                    {sede.Nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6} lg={3}>
                                    <FormControl fullWidth variant="outlined" size="medium">
                                        <InputLabel>Área</InputLabel>
                                        <Select
                                            value={filtros.idArea}
                                            onChange={(e) => handleFiltroChange('idArea', e.target.value)}
                                            label="Área"
                                            disabled={!filtros.idSede || !!filtros.documento}
                                        >
                                            <MenuItem value="">
                                                <em>Todas</em>
                                            </MenuItem>
                                            {areas.map((area) => (
                                                <MenuItem key={area.id} value={area.id}>
                                                    {area.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} className="flex justify-end gap-2 mt-4">
                                    <Button
                                        variant="outlined"
                                        onClick={limpiarFiltros}
                                        startIcon={<RiCloseLine />}
                                        size="large"
                                    >
                                        Limpiar
                                    </Button>
                                    <LoadingButton
                                        loading={loading}
                                        variant="contained"
                                        onClick={generarReporte}
                                        startIcon={<RiSearchLine />}
                                        size="large"
                                    >
                                        Buscar
                                    </LoadingButton>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Paper>

                {filtrosAplicados.length > 0 && (
                    <Box className="mb-4 flex flex-wrap gap-2">
                        {filtrosAplicados.map((filtro, index) => (
                            <Chip
                                key={index}
                                label={filtro}
                                onDelete={() => eliminarFiltro(filtro)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                )}

                <Paper className="overflow-hidden">
                    {loading && <LoadingOverlay />}
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <Typography variant="h6">
                            Resultados ({reporte.length})
                        </Typography>
                        <div className="flex gap-2">
                            <Tooltip title="Exportar a Excel">
                                <span>
                                    <IconButton
                                        onClick={exportarExcel}
                                        disabled={!reporte.length || loading || loadingExport}
                                        color="primary"
                                    >
                                        {loadingExport ? <FaSpinner className="animate-spin" /> : <RiFileExcel2Line />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Enviar por Correo">
                                <span>
                                    <IconButton
                                        onClick={enviarCorreo}
                                        disabled={!reporte.length || loading || loadingExport}
                                        color="primary"
                                    >
                                        {loadingExport ? <FaSpinner className="animate-spin" /> : <RiMailSendLine />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Documento
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Nombre Completo
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Fecha
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Semana
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Hora Entrada Esperada
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Hora Salida Esperada
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Hora Entrada
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Hora Salida
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Minutos Tarde
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Estado Entrada
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Estado Salida
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Lapso de Tiempo
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Estado Marcación
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Empresa Marcación
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Sede Marcación
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={15} className="px-4 py-2 text-center">
                                            <FaSpinner className="animate-spin inline mr-2" />
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : reporte.length === 0 ? (
                                    <tr>
                                        <td colSpan={15} className="px-4 py-2 text-center">
                                            No hay datos para mostrar
                                        </td>
                                    </tr>
                                ) : (
                                    reporte
                                        .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                        .map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.Documento}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.NombreCompleto}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.Fecha}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.Semana}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.HoraEntradaEsperada}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.HoraSalidaEsperada}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.HoraEntrada || '-'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.HoraSalida || '-'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.MinutosTarde || '-'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    row.EstadoEntrada === 'A tiempo' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : row.EstadoEntrada === 'No Marcó'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {row.EstadoEntrada}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    row.EstadoSalida === 'A tiempo' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : row.EstadoSalida === 'No Marcó'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {row.EstadoSalida}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.LapsoTiempo}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    row.EstadoMarcacion === 'Completo' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {row.EstadoMarcacion}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.EmpresaMarcacion}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.SedeMarcacion}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Paper>

                <div className="bg-white rounded-lg shadow-md mb-6 relative mt-4">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">Mostrar</span>
                            <select
                                className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-vml-red min-w-[80px]"
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setPage(0);
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

                        <div className="text-sm text-gray-700">
                            Mostrando {reporte.length > 0 ? page * rowsPerPage + 1 : 0} a {Math.min((page + 1) * rowsPerPage, reporte.length)} de {reporte.length} resultados
                        </div>

                        <div className="flex space-x-1">
                            <button
                                onClick={() => setPage(0)}
                                disabled={page === 0 || reporte.length === 0}
                                className={`px-3 py-1 rounded ${
                                    page === 0 || reporte.length === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                            >
                                «
                            </button>
                            <button
                                onClick={() => setPage(prev => prev - 1)}
                                disabled={page === 0 || reporte.length === 0}
                                className={`px-3 py-1 rounded ${
                                    page === 0 || reporte.length === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                            >
                                ‹
                            </button>

                            {/* Números de página */}
                            {Array.from({ length: Math.ceil(reporte.length / rowsPerPage) }, (_, i) => i)
                                .filter(pageNum => {
                                    if (pageNum === 0 || pageNum === Math.ceil(reporte.length / rowsPerPage) - 1) return true;
                                    if (Math.abs(pageNum - page) <= 1) return true;
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
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`px-3 py-1 rounded ${
                                                page === pageNum
                                                    ? 'bg-vml-red text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}

                            <button
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={page >= Math.ceil(reporte.length / rowsPerPage) - 1 || reporte.length === 0}
                                className={`px-3 py-1 rounded ${
                                    page >= Math.ceil(reporte.length / rowsPerPage) - 1 || reporte.length === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                            >
                                ›
                            </button>
                            <button
                                onClick={() => setPage(Math.ceil(reporte.length / rowsPerPage) - 1)}
                                disabled={page >= Math.ceil(reporte.length / rowsPerPage) - 1 || reporte.length === 0}
                                className={`px-3 py-1 rounded ${
                                    page >= Math.ceil(reporte.length / rowsPerPage) - 1 || reporte.length === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                            >
                                »
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default ReporteEmpresa; 