import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosConfig';
import { LoadingSpinner, SelectWithLoading, LoadingButton } from '../common/LoadingStates';

const SedeForm = ({ onSubmit, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        Nombre: initialData?.Nombre || '',
        IdEmpresa: initialData?.IdEmpresa?.toString() || '',
        IdCiudad: initialData?.IdCiudad?.toString() || '',
        Estado: initialData?.Estado ?? true
    });

    const [empresas, setEmpresas] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);
    const [loadingCiudades, setLoadingCiudades] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setLoadingEmpresas(true);
                setLoadingCiudades(true);

                const [empresasRes, ciudadesRes] = await Promise.all([
                    axiosInstance.get('/empresas'),
                    axiosInstance.get('/ciudades')
                ]);

                if (empresasRes.data?.data) {
                    // Formatear empresas para el select
                    const empresasFormateadas = empresasRes.data.data.map(empresa => ({
                        value: empresa.IdEmpresa.toString(),
                        label: empresa.Nombre
                    }));
                    setEmpresas(empresasFormateadas);
                }
                setLoadingEmpresas(false);

                if (ciudadesRes.data?.data) {
                    // Formatear ciudades para el select
                    const ciudadesFormateadas = ciudadesRes.data.data.map(ciudad => ({
                        value: ciudad.id.toString(),
                        label: ciudad.nombre
                    }));
                    setCiudades(ciudadesFormateadas);
                }
                setLoadingCiudades(false);

                setLoading(false);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setLoadingEmpresas(false);
                setLoadingCiudades(false);
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'Estado' ? value === "1" : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center h-48">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-4">Cargando formulario...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        {initialData ? 'Editar Sede' : 'Nueva Sede'}
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            name="Nombre"
                            value={formData.Nombre}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vml-red focus:border-transparent"
                            required
                            disabled={submitting}
                        />
                    </div>

                    <SelectWithLoading
                        label="Empresa"
                        name="IdEmpresa"
                        value={formData.IdEmpresa}
                        onChange={handleInputChange}
                        options={empresas}
                        isLoading={loadingEmpresas}
                        disabled={submitting}
                        placeholder="Seleccione una empresa"
                    />

                    <SelectWithLoading
                        label="Ciudad"
                        name="IdCiudad"
                        value={formData.IdCiudad}
                        onChange={handleInputChange}
                        options={ciudades}
                        isLoading={loadingCiudades}
                        disabled={submitting}
                        placeholder="Seleccione una ciudad"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            name="Estado"
                            value={formData.Estado ? "1" : "0"}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vml-red focus:border-transparent"
                            disabled={submitting}
                        >
                            <option value="1">Activa</option>
                            <option value="0">Inactiva</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <LoadingButton
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-vml-red focus:ring-offset-2"
                            loading={submitting}
                        >
                            Cancelar
                        </LoadingButton>
                        <LoadingButton
                            type="submit"
                            className="px-4 py-2 bg-vml-red text-white rounded-md hover:bg-vml-red/90 focus:outline-none focus:ring-2 focus:ring-vml-red focus:ring-offset-2"
                            loading={submitting}
                        >
                            {initialData ? 'Actualizar' : 'Crear'}
                        </LoadingButton>
                    </div>
                </form>
            )}
        </motion.div>
    );
};

export default SedeForm; 