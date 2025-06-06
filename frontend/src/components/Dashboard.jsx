import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { LoadingOverlay } from '../components/common/LoadingStates';
import { appIcons, appColors } from '../utils/theme';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        empleados: {
            total: 0,
            activos: 0,
            inactivos: 0,
            porTipo: []
        },
        empresas: {
            total: 0,
            activas: 0,
            inactivas: 0,
            empleadosPorEmpresa: []
        },
        sedes: {
            total: 0,
            activas: 0,
            inactivas: 0,
            empleadosPorSede: []
        },
        areas: {
            total: 0,
            activas: 0,
            inactivas: 0,
            empleadosPorArea: []
        },
        empleadosPorEstado: {
            activos: 0,
            inactivos: 0
        },
        empresasPorEstado: {
            activas: 0,
            inactivas: 0
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            console.log('Intentando obtener datos de estadísticas...');
            
            const response = await axiosInstance.get('/dashboard/stats');

            if (response.data.status === 'success' && response.data.data) {
                console.log('Datos recibidos:', response.data.data);
                setStats(response.data.data);
            } else {
                console.error('Respuesta inesperada:', response.data);
                toast.error('Error al cargar las estadísticas: formato de respuesta inválido');
            }
        } catch (error) {
            console.error('Error al obtener estadísticas:', error.response || error);
            if (error.response?.status === 401) {
                toast.error('Sesión expirada, por favor inicie sesión nuevamente');
                // Opcional: redirigir al login
                window.location.href = '/login';
            } else {
                toast.error('Error al cargar las estadísticas: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const COLORS = [
        appColors.primary,
        appColors.info,
        appColors.success,
        appColors.warning,
        appColors.error
    ];

    const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
        <Card className="h-full">
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" className="mb-2">
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="textSecondary">
                                {subtitle}
                            </Typography>
                        )}
                    </div>
                    <Icon className="h-10 w-10" style={{ color }} />
                </div>
            </CardContent>
        </Card>
    );

    const pieChartData = {
        labels: stats.empleados.porTipo.map(tipo => tipo.tipo),
        datasets: [
            {
                data: stats.empleados.porTipo.map(tipo => tipo.cantidad),
                backgroundColor: COLORS,
                borderColor: COLORS,
                borderWidth: 1,
            },
        ],
    };

    const estadoEmpleadosData = {
        labels: ['Activos', 'Inactivos'],
        datasets: [
            {
                data: [stats.empleados.activos, stats.empleados.inactivos],
                backgroundColor: [appColors.success, appColors.error],
                borderColor: [appColors.success, appColors.error],
                borderWidth: 1,
            },
        ],
    };

    const estadoEmpresasData = {
        labels: ['Activas', 'Inactivas'],
        datasets: [
            {
                data: [stats.empresas.activas, stats.empresas.inactivas],
                backgroundColor: [appColors.success, appColors.error],
                borderColor: [appColors.success, appColors.error],
                borderWidth: 1,
            },
        ],
    };

    const barChartData = {
        labels: stats.empresas.empleadosPorEmpresa.map(emp => emp.nombre),
        datasets: [
            {
                label: 'Empleados',
                data: stats.empresas.empleadosPorEmpresa.map(emp => emp.empleados),
                backgroundColor: appColors.primary,
            },
        ],
    };

    const procesarDatosParaGrafico = (datos, limite = 8) => {
        if (!datos || datos.length <= limite) return datos;

        // Ordenar por cantidad de empleados de mayor a menor y tomar solo los primeros 8
        return [...datos]
            .sort((a, b) => b.empleados - a.empleados)
            .slice(0, limite);
    };

    const sedesChartData = {
        labels: procesarDatosParaGrafico(stats.sedes.empleadosPorSede).map(sede => sede.nombre),
        datasets: [
            {
                label: 'Empleados por Sede',
                data: procesarDatosParaGrafico(stats.sedes.empleadosPorSede).map(sede => sede.empleados),
                backgroundColor: appColors.info,
            },
        ],
    };

    const areasChartData = {
        labels: procesarDatosParaGrafico(stats.areas.empleadosPorArea).map(area => area.nombre),
        datasets: [
            {
                label: 'Empleados por Área',
                data: procesarDatosParaGrafico(stats.areas.empleadosPorArea).map(area => area.empleados),
                backgroundColor: appColors.success,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                display: true,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value} empleados`;
                    }
                }
            }
        }
    };

    const barChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            },
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        },
        plugins: {
            ...chartOptions.plugins,
            legend: {
                display: false
            }
        }
    };

    if (loading) return <LoadingOverlay />;

    return (
        <div className="p-6">
            <Typography variant="h4" gutterBottom className="mb-6">
                Dashboard
            </Typography>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Estadísticas Principales */}
                <div>
                    <StatCard
                        title="Total Empleados"
                        value={stats.empleados.total}
                        subtitle={`${stats.empleados.activos} activos - ${stats.empleados.inactivos} inactivos`}
                        icon={appIcons.group}
                        color={appColors.primary}
                    />
                </div>
                <div>
                    <StatCard
                        title="Total Empresas"
                        value={stats.empresas.total}
                        subtitle={`${stats.empresas.activas} activas - ${stats.empresas.inactivas} inactivas`}
                        icon={appIcons.business}
                        color={appColors.info}
                    />
                </div>
                <div>
                    <StatCard
                        title="Total Sedes"
                        value={stats.sedes.total}
                        subtitle={`${stats.sedes.activas} activas - ${stats.sedes.inactivas} inactivas`}
                        icon={appIcons.building}
                        color={appColors.success}
                    />
                </div>
                <div>
                    <StatCard
                        title="Total Áreas"
                        value={stats.areas.total}
                        subtitle={`${stats.areas.activas} activas - ${stats.areas.inactivas} inactivas`}
                        icon={appIcons.domain}
                        color={appColors.warning}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Gráficos de Estado */}
                <div>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Estado de Empleados
                        </Typography>
                        <div style={{ height: '300px' }}>
                            <Pie data={estadoEmpleadosData} options={chartOptions} />
                        </div>
                    </Paper>
                </div>

                <div>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Tipos de Empleados
                        </Typography>
                        <div style={{ height: '300px' }}>
                            <Pie data={pieChartData} options={chartOptions} />
                        </div>
                    </Paper>
                </div>

                <div>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Estado de Empresas
                        </Typography>
                        <div style={{ height: '300px' }}>
                            <Pie data={estadoEmpresasData} options={chartOptions} />
                        </div>
                    </Paper>
                </div>
            </div>

            {/* Gráficos de Distribución */}
            <div className="mt-6">
                <Paper className="p-4">
                    <Typography variant="h6" gutterBottom>
                        Empleados por Empresa
                    </Typography>
                    <div style={{ height: '300px' }}>
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </Paper>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Empleados por Sede
                        </Typography>
                        <div style={{ height: '300px' }}>
                            <Bar data={sedesChartData} options={barChartOptions} />
                        </div>
                    </Paper>
                </div>

                <div>
                    <Paper className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Empleados por Área
                        </Typography>
                        <div style={{ height: '300px' }}>
                            <Bar data={areasChartData} options={barChartOptions} />
                        </div>
                    </Paper>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 