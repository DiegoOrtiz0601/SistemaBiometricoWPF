import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiSearchLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiEyeLine,
  RiCloseLine,
  RiUploadLine,
  RiAddCircleLine,
} from "react-icons/ri";
import Swal from "sweetalert2";
import SedeForm from "./SedeForm";
import axiosInstance from "../../utils/axiosConfig";
import {
  LoadingOverlay,
  TableLoadingRow,
  EmptyRow,
  LoadingButton,
} from "../common/LoadingStates";
import {
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { appColors } from "../../utils/theme";
import { FaSpinner } from "react-icons/fa";
import { useUpdate } from "../../context/UpdateContext";

const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSede, setEditingSede] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("Nombre");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });
  const { triggerUpdate } = useUpdate();

  const fetchSedes = async () => {
    try {
      setLoading(true);
      console.log("Iniciando petición de sedes...");
      const response = await axiosInstance.get("/sedes", {
        params: {
          page: pagination.currentPage,
          perPage: pagination.perPage,
          search: searchTerm,
          sortField,
          sortDirection
        }
      });
      
      console.log("Respuesta del servidor:", response.data);
      
      // Asegurarse de que los datos incluyan los nombres de empresa y ciudad
      const sedesConNombres = response.data.data.map(sede => ({
        ...sede,
        NombreEmpresa: sede.NombreEmpresa || 'No asignada',
        NombreCiudad: sede.NombreCiudad || 'No asignada'
      }));

      setSedes(sedesConNombres);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        perPage: response.data.per_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Error al cargar sedes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las sedes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, [pagination.currentPage, pagination.perPage, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoadingAction(true);
      if (editingSede) {
        await axiosInstance.put(`/sedes/${editingSede.IdSede}`, formData);
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Sede actualizada exitosamente",
        });
      } else {
        await axiosInstance.post("/sedes", formData);
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Sede creada exitosamente",
        });
      }
      setShowForm(false);
      setEditingSede(null);
      fetchSedes();
      triggerUpdate('ciudades');
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la sede",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        setLoadingAction(true);
        await axiosInstance.delete(`/sedes/${id}`);
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Sede eliminada exitosamente",
        });
        fetchSedes();
        triggerUpdate('ciudades');
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la sede",
        });
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleEdit = (sede) => {
    setEditingSede(sede);
    setShowForm(true);
  };

  const handleView = (sede) => {
    Swal.fire({
      title: "Detalles de la Sede",
      html: `
                <div class="text-left">
                    <p><strong>Nombre:</strong> ${sede.Nombre}</p>
                    <p><strong>Empresa:</strong> ${sede.NombreEmpresa}</p>
                    <p><strong>Ciudad:</strong> ${sede.NombreCiudad}</p>
                    <p><strong>Estado:</strong> ${sede.Estado ? "Activa" : "Inactiva"}</p>
                </div>
            `,
      confirmButtonText: "Cerrar",
    });
  };

  const SortIcon = ({ field }) => {
    if (field !== sortField)
      return <RiArrowUpSLine className="text-gray-400" />;
    return sortDirection === "asc" ? (
      <RiArrowUpSLine className="text-vml-red" />
    ) : (
      <RiArrowDownSLine className="text-vml-red" />
    );
  };

  const handleOpenModal = () => {
    setEditingSede(null);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Sedes</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-vml-red hover:bg-vml-red/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          onClick={() => {
            setEditingSede(null);
            setShowForm(true);
          }}
        >
          <RiAddLine />
          <span>Nueva Sede</span>
        </motion.button>
      </div>

      <div className="mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar sede..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <RiSearchLine className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("Nombre")}
                >
                  NOMBRE <SortIcon field="Nombre" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("Empresa")}
                >
                  EMPRESA <SortIcon field="Empresa" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("Ciudad")}
                >
                  CIUDAD <SortIcon field="Ciudad" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("Estado")}
                >
                  ESTADO <SortIcon field="Estado" />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <TableLoadingRow colSpan={5} />
              ) : sedes.length === 0 ? (
                <EmptyRow colSpan={5} message="No se encontraron sedes" />
              ) : (
                <AnimatePresence mode="popLayout">
                  {sedes.map((sede) => (
                    <motion.tr
                      key={sede.IdSede}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sede.Nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sede.NombreEmpresa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sede.NombreCiudad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sede.Estado
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sede.Estado ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <LoadingButton
                            onClick={() => handleView(sede)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded-full transition-colors"
                            title="Ver detalles"
                            loading={loadingAction}
                          >
                            <RiEyeLine className="text-xl" />
                          </LoadingButton>
                          <LoadingButton
                            onClick={() => handleEdit(sede)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded-full transition-colors"
                            title="Editar"
                            loading={loadingAction}
                          >
                            <RiEditLine className="text-xl" />
                          </LoadingButton>
                          <LoadingButton
                            onClick={() => handleDelete(sede.IdSede)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded-full transition-colors"
                            title="Eliminar"
                            loading={loadingAction}
                          >
                            <RiDeleteBin6Line className="text-xl" />
                          </LoadingButton>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mt-4">
        <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Mostrar</span>
            <div className="relative">
              <select
                className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-vml-red min-w-[80px]"
                value={pagination.perPage}
                onChange={(e) => {
                  const newPerPage = Number(e.target.value);
                  setPagination(prev => ({
                    ...prev,
                    perPage: newPerPage,
                    currentPage: 1
                  }));
                }}
                disabled={loading}
              >
                {[5, 10, 25, 50, 100].map(option => (
                  <option key={option} value={option} className="py-1">
                    {option}
                  </option>
                ))}
              </select>
              {loading && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <FaSpinner className="animate-spin text-gray-400 text-sm" />
                </div>
              )}
            </div>
            <span className="text-sm text-gray-700">registros por página</span>
          </div>
          <div className="text-sm text-gray-700">
            Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} a {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de {pagination.total} registros
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
              disabled={pagination.currentPage === 1}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              «
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ‹
            </button>
            {[...Array(pagination.lastPage)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === pagination.lastPage ||
                (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                    className={`px-3 py-1 rounded ${
                      pagination.currentPage === page
                      ? 'bg-vml-red text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.currentPage - 2 ||
                page === pagination.currentPage + 2
              ) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.lastPage}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === pagination.lastPage
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ›
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.lastPage }))}
              disabled={pagination.currentPage === pagination.lastPage}
              className={`px-3 py-1 rounded ${
                pagination.currentPage === pagination.lastPage
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              »
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <SedeForm
              onSubmit={handleSubmit}
              initialData={editingSede}
              onCancel={() => {
                setShowForm(false);
                setEditingSede(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sedes;
