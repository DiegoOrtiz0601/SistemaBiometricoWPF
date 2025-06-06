// src/utils/theme.js

// 🧩 Importación de íconos desde MUI
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DomainIcon from '@mui/icons-material/Domain';

// 🎨 Colores principales de la aplicación
export const appColors = {
    primary: '#E31937',     // Rojo VML
    secondary: '#1F2937',   // Gris oscuro
    accent: '#3B82F6',      // Azul para acentos
    success: '#10B981',     // Verde éxito
    warning: '#F59E0B',     // Amarillo advertencia
    error: '#EF4444',       // Rojo errores
    background: '#F3F4F6',  // Fondo general
    surface: '#FFFFFF',     // Superficie tarjetas, etc.
    text: {
        primary: '#1F2937',
        secondary: '#4B5563',
        disabled: '#9CA3AF'
    }
};

// 🧱 Iconos usados en las tarjetas o indicadores
export const appIcons = {
    group: GroupIcon,
    business: BusinessIcon,
    building: LocationCityIcon,
    domain: DomainIcon
};

// 🕳️ Sombras para elevación de componentes
export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
};

// 🟦 Bordes redondeados
export const borders = {
    radius: {
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px'
    }
};

// 📐 Espaciados reutilizables
export const spacing = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
};

// ⏱️ Transiciones estándar
export const transitions = {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.45s ease'
};
