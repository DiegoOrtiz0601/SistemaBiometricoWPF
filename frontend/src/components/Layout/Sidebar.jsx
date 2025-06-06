import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    RiDashboardLine, 
    RiBuilding2Line, 
    RiBuildingLine,
    RiMapPinLine,
    RiTeamLine,
    RiTimeLine,
    RiFileChartLine,
    RiLayoutGridLine,
    RiUserSettingsLine
} from 'react-icons/ri';

const menuItems = [
    { path: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
    { path: '/ciudades', icon: RiMapPinLine, label: 'Ciudades' },
    { path: '/empresas', icon: RiBuilding2Line, label: 'Empresas' },
    { path: '/sedes', icon: RiBuildingLine, label: 'Sedes' },
    { path: '/areas', icon: RiLayoutGridLine, label: 'Áreas' },
    { path: '/empleados', icon: RiTeamLine, label: 'Empleados' },
    { path: '/horarios', icon: RiTimeLine, label: 'Horarios' },
    { path: '/usuarios', icon: RiUserSettingsLine, label: 'Usuarios' },
    { path: '/reportes', icon: RiFileChartLine, label: 'Reportes' },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <motion.div 
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="bg-white h-screen w-64 fixed left-0 shadow-lg"
        >
            <div className="p-6">
                <h2 className="text-2xl font-bold text-vml-red mb-8">VML Biométrico</h2>
                <nav>
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <motion.li 
                                    key={item.path}
                                    whileHover={{ x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link
                                        to={item.path}
                                        className={`flex items-center p-3 rounded-lg transition-colors duration-200
                                            ${isActive 
                                                ? 'bg-vml-red text-white' 
                                                : 'text-gray-700 hover:bg-vml-red/10 hover:text-vml-red'
                                            }`}
                                    >
                                        <item.icon className={`text-xl ${isActive ? 'text-white' : 'text-vml-red'}`} />
                                        <span className="ml-3">{item.label}</span>
                                    </Link>
                                </motion.li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </motion.div>
    );
};

export default Sidebar; 