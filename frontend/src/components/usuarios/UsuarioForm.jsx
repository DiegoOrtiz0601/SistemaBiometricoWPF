import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    InputAdornment,
    FormHelperText
} from '@mui/material';
import { RiCloseLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import axiosInstance from '../../utils/axiosConfig';
import { LoadingButton } from '../common/LoadingStates';

const UsuarioForm = ({ onSubmit, onClose, usuarioToEdit }) => {
    const [formData, setFormData] = useState({
        Nombre: '',
        NombreUsuario: '',
        Correo: '',
        Contrasena: '',
        RolUsuario: '',
        estado: true
    });

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (usuarioToEdit) {
            setFormData({
                Nombre: usuarioToEdit.Nombre || '',
                NombreUsuario: usuarioToEdit.NombreUsuario || '',
                Correo: usuarioToEdit.Correo || '',
                Contrasena: '',
                RolUsuario: usuarioToEdit.RolUsuario || '',
                estado: usuarioToEdit.estado
            });
        }
        fetchRoles();
    }, [usuarioToEdit]);

    const fetchRoles = async () => {
        try {
            const response = await axiosInstance.get('/usuarios/roles');
            if (response.data.success) {
                setRoles(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar roles:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.Nombre.trim()) {
            newErrors.Nombre = 'El nombre es requerido';
        }
        
        if (!formData.NombreUsuario.trim()) {
            newErrors.NombreUsuario = 'El nombre de usuario es requerido';
        }
        
        if (!formData.Correo.trim()) {
            newErrors.Correo = 'El correo es requerido';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.Correo)) {
            newErrors.Correo = 'Correo electrónico inválido';
        }
        
        if (!usuarioToEdit && !formData.Contrasena) {
            newErrors.Contrasena = 'La contraseña es requerida';
        } else if (!usuarioToEdit && formData.Contrasena.length < 6) {
            newErrors.Contrasena = 'La contraseña debe tener al menos 6 caracteres';
        }
        
        if (!formData.RolUsuario) {
            newErrors.RolUsuario = 'El rol es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error al procesar el formulario:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={true}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
        >
            <DialogTitle className="flex justify-between items-center">
                {usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                <IconButton onClick={onClose} disabled={loading}>
                    <RiCloseLine />
                </IconButton>
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <div className="space-y-4">
                        <TextField
                            fullWidth
                            label="Nombres Completos"
                            name="Nombre"
                            value={formData.Nombre}
                            onChange={handleChange}
                            error={!!errors.Nombre}
                            helperText={errors.Nombre}
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            label="Nombre de Usuario"
                            name="NombreUsuario"
                            value={formData.NombreUsuario}
                            onChange={handleChange}
                            error={!!errors.NombreUsuario}
                            helperText={errors.NombreUsuario}
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            label="Correo Electrónico"
                            name="Correo"
                            type="email"
                            value={formData.Correo}
                            onChange={handleChange}
                            error={!!errors.Correo}
                            helperText={errors.Correo}
                            disabled={loading}
                        />

                        {!usuarioToEdit && (
                            <TextField
                                fullWidth
                                label="Contraseña"
                                name="Contrasena"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.Contrasena}
                                onChange={handleChange}
                                error={!!errors.Contrasena}
                                helperText={errors.Contrasena}
                                disabled={loading}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}

                        <FormControl fullWidth error={!!errors.RolUsuario}>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                name="RolUsuario"
                                value={formData.RolUsuario}
                                onChange={handleChange}
                                label="Rol"
                                disabled={loading}
                            >
                                {roles.map((rol) => (
                                    <MenuItem key={rol.idRolUsuario} value={rol.idRolUsuario}>
                                        {rol.nombreRol}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.RolUsuario && (
                                <FormHelperText>{errors.RolUsuario}</FormHelperText>
                            )}
                        </FormControl>

                        {usuarioToEdit && (
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    label="Estado"
                                    disabled={loading}
                                >
                                    <MenuItem value={true}>Activo</MenuItem>
                                    <MenuItem value={false}>Inactivo</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </div>
                </DialogContent>

                <DialogActions className="p-4 space-x-2">
                    <Button
                        onClick={onClose}
                        disabled={loading}
                        variant="outlined"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50 normal-case"
                    >
                        Cancelar
                    </Button>
                    <LoadingButton
                        type="submit"
                        loading={loading}
                        className="bg-vml-red hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200 normal-case"
                    >
                        {usuarioToEdit ? 'Actualizar' : 'Crear'}
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UsuarioForm; 