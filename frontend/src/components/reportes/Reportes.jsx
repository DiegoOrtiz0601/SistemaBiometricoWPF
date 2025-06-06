import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiFileChartLine, RiBuilding2Line } from 'react-icons/ri';

const Reportes = () => {
    const reportes = [
        {
            id: 'empresa',
            titulo: 'Reporte por Empresa',
            descripcion: 'Genera reportes de asistencia filtrados por empresa',
            icono: RiBuilding2Line,
            ruta: '/reportes/empresa'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportes.map((reporte) => (
                    <motion.div
                        key={reporte.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to={reporte.ruta}
                            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="bg-vml-red/10 p-3 rounded-lg">
                                    <reporte.icono className="text-2xl text-vml-red" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">{reporte.titulo}</h2>
                                    <p className="text-gray-600 text-sm mt-1">{reporte.descripcion}</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Reportes; 