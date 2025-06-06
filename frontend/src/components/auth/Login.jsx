import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { RiUserLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

const Login = () => {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Enviamos los campos con los nombres EXACTOS que espera Laravel
            const result = await login({
                Correo: credentials.email,
                Contrasena: credentials.password
            });

            if (!result.success) {
                setError(result.message || 'Credenciales inválidas');
                setCredentials(prev => ({ ...prev, password: '' }));
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error al iniciar sesión');
            setCredentials(prev => ({ ...prev, password: '' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-vml-light relative overflow-hidden">
            {/* Elementos decorativos de fondo con gradiente más intenso */}
            <div className="absolute inset-0 bg-gradient-to-br from-vml-gray/20 to-vml-red/20" />
            
            {/* Formas geométricas animadas mejoradas */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute ${i % 2 === 0 ? 'rounded-full' : 'rounded-md'} 
                               ${i % 3 === 0 ? 'bg-vml-red/10' : 'bg-vml-gray/10'} 
                               backdrop-blur-sm`}
                    animate={{
                        scale: [
                            1,
                            i % 2 === 0 ? 1.5 : 1.2,
                            1
                        ],
                        rotate: [
                            0,
                            i % 2 === 0 ? 180 : -180,
                            0
                        ],
                        x: [
                            0,
                            (i % 2 === 0 ? 100 : -100) * Math.random(),
                            0
                        ],
                        y: [
                            0,
                            (i % 2 === 0 ? -100 : 100) * Math.random(),
                            0
                        ],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                        duration: 5 + i * 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                    style={{
                        width: Math.random() * 150 + 100,
                        height: Math.random() * 150 + 100,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        filter: 'blur(1px)',
                        zIndex: 0
                    }}
                />
            ))}

            {/* Elementos decorativos adicionales */}
            <motion.div
                className="absolute inset-0"
                animate={{
                    background: [
                        'radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)'
                    ]
                }}
                transition={{
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Infinity
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-96 relative z-10"
            >
                <div className="flex flex-col items-center">
                    <motion.img
                        src="/assets/img/logo.gif"
                        alt="Logo"
                        className="h-24 w-auto mb-4"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    />
                    <motion.h2 
                        className="text-center text-3xl font-extrabold text-gray-900"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Iniciar Sesión
                    </motion.h2>
                    <motion.p 
                        className="mt-2 text-center text-sm text-gray-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Ingresa tus credenciales para continuar
                    </motion.p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <motion.div 
                        className="rounded-md shadow-sm -space-y-px"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="relative group">
                            <RiUserLine className="absolute top-3 left-3 text-gray-400 text-xl transition-colors group-hover:text-vml-red" />
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-t-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-vml-red focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200 hover:border-vml-red/50"
                                placeholder="Correo electrónico"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            />
                        </div>
                        <div className="relative group">
                            <RiLockLine className="absolute top-3 left-3 text-gray-400 text-xl transition-colors group-hover:text-vml-red" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="appearance-none rounded-b-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-vml-red focus:border-transparent focus:z-10 sm:text-sm transition-all duration-200 hover:border-vml-red/50"
                                placeholder="Contraseña"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                            <motion.button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-2 right-3 p-1 text-gray-400 hover:text-vml-red focus:outline-none transition-colors duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {showPassword ? <RiEyeOffLine className="text-xl" /> : <RiEyeLine className="text-xl" />}
                            </motion.button>
                        </div>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-500 text-sm text-center p-3 rounded-lg border border-red-200"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-vml-red hover:bg-vml-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vml-red transition-all duration-300 ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        Iniciando sesión...
                                    </motion.span>
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login; 