import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    InputAdornment
} from '@mui/material';
import { RiCloseLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { LoadingButton } from '../common/LoadingStates';

const CambiarPasswordForm = ({ onSubmit, onClose, usuario }) => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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
        
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Debe confirmar la contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
            await onSubmit({ password: formData.password });
            onClose();
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
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
                Cambiar Contraseña - {usuario.Nombre}
                <IconButton onClick={onClose} disabled={loading}>
                    <RiCloseLine />
                </IconButton>
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <div className="space-y-4">
                        <TextField
                            fullWidth
                            label="Nueva Contraseña"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
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

                        <TextField
                            fullWidth
                            label="Confirmar Contraseña"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                </DialogContent>

                <DialogActions className="p-4">
                    <Button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Cancelar
                    </Button>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={loading}
                        className="bg-vml-red hover:bg-red-700 text-white"
                    >
                        Cambiar Contraseña
                    </LoadingButton>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CambiarPasswordForm; 