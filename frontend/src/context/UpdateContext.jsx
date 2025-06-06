import React, { createContext, useContext, useState, useCallback } from 'react';

const UpdateContext = createContext();

export const UpdateProvider = ({ children }) => {
    const [updateFlags, setUpdateFlags] = useState({
        ciudades: 0,
        empresas: 0,
        sedes: 0,
        areas: 0,
        empleados: 0,
        horarios: 0,
        usuarios: 0
    });

    const triggerUpdate = useCallback((entity) => {
        setUpdateFlags(prev => ({
            ...prev,
            [entity]: prev[entity] + 1
        }));
    }, []);

    return (
        <UpdateContext.Provider value={{ updateFlags, triggerUpdate }}>
            {children}
        </UpdateContext.Provider>
    );
};

export const useUpdate = () => {
    const context = useContext(UpdateContext);
    if (!context) {
        throw new Error('useUpdate debe ser usado dentro de un UpdateProvider');
    }
    return context;
}; 