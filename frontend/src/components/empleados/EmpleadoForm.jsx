import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosConfig';
import { LoadingSpinner, LoadingButton, LoadingOverlay, SelectWithLoading } from '../common/LoadingStates';

const EmpleadoForm = ({ onSubmit, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        Nombres: initialData?.Nombres || '',
        Apellidos: initialData?.Apellidos || '',
        Documento: initialData?.Documento || '',
        IdEmpresa: initialData?.IdEmpresa?.toString() || '',
        IdSede: initialData?.IdSede?.toString() || '',
        IdArea: initialData?.IdArea?.toString() || '',
        IdTipoEmpleado: initialData?.IdTipoEmpleado?.toString() || '',
        Estado: initialData?.Estado ?? true,
        FechaIngreso: initialData?.FechaIngreso || new Date().toISOString().split('T')[0]
    });

    const [empresas, setEmpresas] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [areas, setAreas] = useState([]);
    const [tiposEmpleado, setTiposEmpleado] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);
    const [loadingTipos, setLoadingTipos] = useState(true);
    const [loadingSedes, setLoadingSedes] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);

    // Cargar datos base (empresas y tipos)
    useEffect(() => {
        const loadBaseData = async () => {
            try {
                setLoading(true);
                setLoadingEmpresas(true);
                setLoadingTipos(true);

                const [empresasRes, tiposRes] = await Promise.all([
                    axiosInstance.get('/empresas/activas'),
                    axiosInstance.get('/empleados/tipos')
                ]);

                if (empresasRes.data?.success && empresasRes.data?.data) {
                    const empresasFormateadas = empresasRes.data.data.map(empresa => ({
                        value: empresa.id.toString(),
                        label: empresa.nombre
                    }));
                    setEmpresas(empresasFormateadas);
                }

                if (tiposRes.data?.data) {
                    const tiposFormateados = tiposRes.data.data.map(tipo => ({
                        value: tipo.id.toString(),
                        label: tipo.nombre
                    }));
                    setTiposEmpleado(tiposFormateados);
                }
            } catch (error) {
                console.error('Error al cargar datos base:', error);
            } finally {
                setLoadingEmpresas(false);
                setLoadingTipos(false);
                setLoading(false);
            }
        };

        loadBaseData();
    }, []);

    // Cargar sedes cuando cambia la empresa
    useEffect(() => {
        const loadSedes = async () => {
            if (!formData.IdEmpresa) {
                setSedes([]);
                setFormData(prev => ({ ...prev, IdSede: '', IdArea: '' }));
                return;
            }

            try {
                setLoadingSedes(true);
                setFormData(prev => ({ ...prev, IdSede: '', IdArea: '' }));
                setAreas([]); // Limpiar áreas cuando cambia la empresa
                
                const sedesRes = await axiosInstance.get(`/sedes/empresa/${formData.IdEmpresa}`);

                if (sedesRes.data?.success && sedesRes.data?.data) {
                    const sedesFormateadas = sedesRes.data.data.map(sede => ({
                        value: sede.IdSede.toString(),
                        label: sede.Nombre
                    }));
                    setSedes(sedesFormateadas);
                }
            } catch (error) {
                console.error('Error al cargar sedes:', error);
                setSedes([]);
            } finally {
                setLoadingSedes(false);
            }
        };

        loadSedes();
    }, [formData.IdEmpresa]);

    // Cargar áreas cuando cambia la sede
    useEffect(() => {
        const loadAreas = async () => {
            if (!formData.IdSede) {
                setAreas([]);
                setFormData(prev => ({ ...prev, IdArea: '' }));
                return;
            }

            try {
                setLoadingAreas(true);
                setFormData(prev => ({ ...prev, IdArea: '' }));
                
                const areasRes = await axiosInstance.get(`/areas/sede/${formData.IdSede}`);

                if (areasRes.data?.success && areasRes.data?.data) {
                    const areasFormateadas = areasRes.data.data.map(area => ({
                        value: area.id.toString(),
                        label: area.nombre
                    }));
                    setAreas(areasFormateadas);
                }
            } catch (error) {
                console.error('Error al cargar áreas:', error);
                setAreas([]);
            } finally {
                setLoadingAreas(false);
            }
        };

        loadAreas();
    }, [formData.IdSede]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'Estado') {
            setFormData(prev => ({
                ...prev,
                [name]: value === "1"
            }));
        } else if (name === 'IdEmpresa') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                IdSede: '',
                IdArea: ''
            }));
        } else if (name === 'IdSede') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                IdArea: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'Nombres' || name === 'Apellidos' ? value.toUpperCase() : value
            }));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative"
        >
            {loading && <LoadingOverlay message="Cargando datos..." />}
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {initialData ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Documento
                        </label>
                        <input
                            type="text"
                            name="Documento"
                            value={formData.Documento}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vml-red focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Ingreso
                        </label>
                        <input
                            type="date"
                            name="FechaIngreso"
                            value={formData.FechaIngreso}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vml-red focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombres
                        </label>
                        <input
                            type="text"
                            name="Nombres"
                            value={formData.Nombres}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vml-red focus:border-transparent uppercase"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellidos
                        </label>
                        <input
                            type="text"
                            name="Apellidos"
                            value={formData.Apellidos}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vml-red focus:border-transparent uppercase"
                            required
                        />
                    </div>

                    <SelectWithLoading
                        label="Empresa"
                        name="IdEmpresa"
                        value={formData.IdEmpresa}
                        onChange={handleInputChange}
                        options={empresas}
                        isLoading={loadingEmpresas}
                        placeholder="Seleccione una empresa"
                    />

                    <SelectWithLoading
                        label="Sede"
                        name="IdSede"
                        value={formData.IdSede}
                        onChange={handleInputChange}
                        options={sedes}
                        isLoading={loadingSedes}
                        disabled={!formData.IdEmpresa}
                        placeholder="Seleccione una sede"
                    />

                    <SelectWithLoading
                        label="Área"
                        name="IdArea"
                        value={formData.IdArea}
                        onChange={handleInputChange}
                        options={areas}
                        isLoading={loadingAreas}
                        disabled={!formData.IdSede}
                        placeholder="Seleccione un área"
                    />

                    <SelectWithLoading
                        label="Tipo de Empleado"
                        name="IdTipoEmpleado"
                        value={formData.IdTipoEmpleado}
                        onChange={handleInputChange}
                        options={tiposEmpleado}
                        isLoading={loadingTipos}
                        placeholder="Seleccione un tipo"
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
                        >
                            <option value="1">Activo</option>
                            <option value="0">Inactivo</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-vml-red focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-vml-red text-white rounded-md hover:bg-vml-red/90 focus:outline-none focus:ring-2 focus:ring-vml-red focus:ring-offset-2"
                    >
                        {initialData ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default EmpleadoForm; 