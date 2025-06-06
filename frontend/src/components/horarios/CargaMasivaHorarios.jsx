import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RiCloseLine, RiDownloadLine, RiUploadLine } from 'react-icons/ri';
import { FaSpinner } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import Swal from 'sweetalert2';

const CargaMasivaHorarios = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStatus, setProcessingStatus] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, seleccione un archivo CSV válido'
            });
            e.target.value = '';
        }
    };

    const descargarFormato = async () => {
        try {
            const response = await axiosInstance.get('/formatos/plantilla_horarios.csv', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'plantilla_horarios.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar el formato:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo descargar el formato'
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor, seleccione un archivo CSV'
            });
            return;
        }

        try {
            setLoading(true);
            setProcessingStatus('Validando archivo...');
            setUploadProgress(10);

            console.log('Iniciando carga de archivo:', {
                nombre: file.name,
                tamaño: file.size,
                tipo: file.type
            });

            const formData = new FormData();
            formData.append('archivo', file);

            try {
                const response = await axiosInstance.post('/asignacion-horarios/carga-masiva', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
                        console.log('Progreso de carga:', progress + '%');
                        setUploadProgress(progress);
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: 0
                });

                console.log('Respuesta del servidor:', response.data);

                if (response.data.success) {
                    setProcessingStatus('Procesando registros...');
                    setUploadProgress(75);

                    // Simular progreso del procesamiento
                    setTimeout(() => {
                        setUploadProgress(100);
                        setProcessingStatus('¡Proceso completado!');
                        
                        Swal.fire({
                            icon: 'success',
                            title: '¡Éxito!',
                            text: response.data.message || 'Horarios cargados exitosamente',
                            showConfirmButton: true
                        }).then(() => {
                            if (onSuccess) onSuccess();
                            onClose();
                        });
                    }, 1000);
                } else {
                    throw new Error(response.data.message || 'Error al procesar el archivo');
                }
            } catch (error) {
                console.error('Error en la carga:', error);
                
                if (error.response?.data?.errores?.errores_por_documento) {
                    const errores = error.response.data.errores.errores_por_documento;
                    let mensajeDetallado = '<div class="text-left space-y-4">';

                    // Crear acordeón para cada documento
                    Object.entries(errores).forEach(([documento, datos]) => {
                        mensajeDetallado += `
                            <div class="border rounded-lg overflow-hidden">
                                <div class="bg-gray-100 p-3 flex justify-between items-center cursor-pointer" 
                                     onclick="this.nextElementSibling.classList.toggle('hidden')">
                                    <span class="font-bold">
                                        ${datos.documento} 
                                        <span class="text-sm text-gray-600">(Línea ${datos.linea})</span>
                                    </span>
                                    <svg class="w-5 h-5 transform transition-transform duration-200" 
                                         style="transform: rotate(0deg);" 
                                         fill="none" 
                                         stroke="currentColor" 
                                         viewBox="0 0 24 24">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </div>
                                <div class="hidden p-3 border-t">
                                    ${datos.errores.map(error => `
                                        <div class="flex items-start space-x-2 mb-2">
                                            <span class="text-red-500">•</span>
                                            <span>${error}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    });

                    mensajeDetallado += '</div>';

                    // Agregar estilos CSS para la animación
                    const styles = `
                        <style>
                            .text-left { text-align: left; }
                            .space-y-4 > * + * { margin-top: 1rem; }
                            .border { border: 1px solid #e2e8f0; }
                            .rounded-lg { border-radius: 0.5rem; }
                            .overflow-hidden { overflow: hidden; }
                            .bg-gray-100 { background-color: #f7fafc; }
                            .p-3 { padding: 0.75rem; }
                            .flex { display: flex; }
                            .justify-between { justify-content: space-between; }
                            .items-center { align-items: center; }
                            .cursor-pointer { cursor: pointer; }
                            .font-bold { font-weight: 700; }
                            .text-sm { font-size: 0.875rem; }
                            .text-gray-600 { color: #718096; }
                            .transform { transform-origin: center; }
                            .transition-transform { transition: transform 0.2s; }
                            .border-t { border-top: 1px solid #e2e8f0; }
                            .text-red-500 { color: #f56565; }
                            .mb-2 { margin-bottom: 0.5rem; }
                            .items-start { align-items: flex-start; }
                            .space-x-2 > * + * { margin-left: 0.5rem; }
                        </style>
                    `;

                    Swal.fire({
                        icon: 'error',
                        title: 'Errores en el archivo',
                        html: styles + mensajeDetallado,
                        showConfirmButton: true,
                        width: '600px',
                        didOpen: () => {
                            // Agregar evento click para rotar las flechas
                            document.querySelectorAll('.bg-gray-100').forEach(header => {
                                header.addEventListener('click', function() {
                                    const arrow = this.querySelector('svg');
                                    const content = this.nextElementSibling;
                                    if (content.classList.contains('hidden')) {
                                        arrow.style.transform = 'rotate(180deg)';
                                    } else {
                                        arrow.style.transform = 'rotate(0deg)';
                                    }
                                });
                            });
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Error al procesar el archivo'
                    });
                }
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error en la carga:', error);
            
            if (error.response?.data?.errores?.errores_por_documento) {
                const errores = error.response.data.errores.errores_por_documento;
                let mensajeDetallado = '<div class="text-left space-y-4">';

                // Crear acordeón para cada documento
                Object.entries(errores).forEach(([documento, datos]) => {
                    mensajeDetallado += `
                        <div class="border rounded-lg overflow-hidden">
                            <div class="bg-gray-100 p-3 flex justify-between items-center cursor-pointer" 
                                 onclick="this.nextElementSibling.classList.toggle('hidden')">
                                <span class="font-bold">
                                    ${datos.documento} 
                                    <span class="text-sm text-gray-600">(Línea ${datos.linea})</span>
                                </span>
                                <svg class="w-5 h-5 transform transition-transform duration-200" 
                                     style="transform: rotate(0deg);" 
                                     fill="none" 
                                     stroke="currentColor" 
                                     viewBox="0 0 24 24">
                                    <path stroke-linecap="round" 
                                          stroke-linejoin="round" 
                                          stroke-width="2" 
                                          d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                            <div class="hidden p-3 border-t">
                                ${datos.errores.map(error => `
                                    <div class="flex items-start space-x-2 mb-2">
                                        <span class="text-red-500">•</span>
                                        <span>${error}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });

                mensajeDetallado += '</div>';

                // Agregar estilos CSS para la animación
                const styles = `
                    <style>
                        .text-left { text-align: left; }
                        .space-y-4 > * + * { margin-top: 1rem; }
                        .border { border: 1px solid #e2e8f0; }
                        .rounded-lg { border-radius: 0.5rem; }
                        .overflow-hidden { overflow: hidden; }
                        .bg-gray-100 { background-color: #f7fafc; }
                        .p-3 { padding: 0.75rem; }
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .items-center { align-items: center; }
                        .cursor-pointer { cursor: pointer; }
                        .font-bold { font-weight: 700; }
                        .text-sm { font-size: 0.875rem; }
                        .text-gray-600 { color: #718096; }
                        .transform { transform-origin: center; }
                        .transition-transform { transition: transform 0.2s; }
                        .border-t { border-top: 1px solid #e2e8f0; }
                        .text-red-500 { color: #f56565; }
                        .mb-2 { margin-bottom: 0.5rem; }
                        .items-start { align-items: flex-start; }
                        .space-x-2 > * + * { margin-left: 0.5rem; }
                    </style>
                `;

                Swal.fire({
                    icon: 'error',
                    title: 'Errores en el archivo',
                    html: styles + mensajeDetallado,
                    showConfirmButton: true,
                    width: '600px',
                    didOpen: () => {
                        // Agregar evento click para rotar las flechas
                        document.querySelectorAll('.bg-gray-100').forEach(header => {
                            header.addEventListener('click', function() {
                                const arrow = this.querySelector('svg');
                                const content = this.nextElementSibling;
                                if (content.classList.contains('hidden')) {
                                    arrow.style.transform = 'rotate(180deg)';
                                } else {
                                    arrow.style.transform = 'rotate(0deg)';
                                }
                            });
                        });
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Error al procesar el archivo'
                });
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Cargar Horarios</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <RiCloseLine className="text-2xl" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-600 text-sm mb-4">
                            Descargue el siguiente formato de referencia para hacer una carga masiva de horarios
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={descargarFormato}
                            className="w-full bg-vml-red text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-vml-red/90 transition-colors"
                            disabled={loading}
                        >
                            <RiDownloadLine className="text-xl" />
                            Descargar Formato
                        </motion.button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar archivo CSV
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:border-vml-red transition-colors">
                                    <RiUploadLine className="text-4xl text-gray-400" />
                                    <span className="mt-2 text-base text-gray-600">
                                        {file ? file.name : 'Seleccione un archivo'}
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </div>

                        {loading && (
                            <div className="space-y-3">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-vml-red"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 text-center">
                                    {processingStatus}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="px-4 py-2 bg-vml-red text-white rounded-lg hover:bg-vml-red/90 transition-colors flex items-center gap-2"
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <RiUploadLine />
                                        Cargar
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CargaMasivaHorarios; 