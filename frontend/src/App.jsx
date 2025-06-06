import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UpdateProvider } from './context/UpdateContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import Layout from './components/Layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import Ciudades from './components/ciudades/Ciudades';
import Empresas from './components/empresas/Empresas';
import Sedes from './components/sedes/Sedes';
import Areas from './components/areas/Areas';
import Empleados from './components/empleados/Empleados';
import Horarios from './components/horarios/Horarios';
import Usuarios from './components/usuarios/Usuarios';
import Reportes from './components/reportes/Reportes';
import ReporteEmpresa from './components/reportes/ReporteEmpresa';
import { navigationConfig } from './router/config';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    
    React.useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { replace: true });
        }
    }, [user, loading, navigate]);
    
    if (loading) {
        return <div>Cargando...</div>;
    }
    
    return children;
};

function AppRoutes() {
    return (
        <Routes {...navigationConfig}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ciudades" element={<Ciudades />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/sedes" element={<Sedes />} />
                <Route path="/areas" element={<Areas />} />
                <Route path="/empleados" element={<Empleados />} />
                <Route path="/horarios" element={<Horarios />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/reportes/empresa" element={<ReporteEmpresa />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <UpdateProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                    <AppRoutes />
                </LocalizationProvider>
            </UpdateProvider>
        </AuthProvider>
    );
}

export default App;
