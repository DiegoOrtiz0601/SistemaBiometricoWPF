import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner, LoadingButton } from '../common/LoadingStates';

const CiudadForm = ({ onSubmit, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        Nombre: initialData?.Nombre || '',
        Estado: initialData?.Estado ?? true
    });

    const [submitting, setSubmitting] = useState(false);

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
            const dataToSubmit = {
                nombre: formData.Nombre,
                estado: formData.Estado ? "1" : "0"
            };
            await onSubmit(dataToSubmit);
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
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {initialData ? 'Editar Ciudad' : 'Nueva Ciudad'}
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
        </motion.div>
    );
};

export default CiudadForm; 