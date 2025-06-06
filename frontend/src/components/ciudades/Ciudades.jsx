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
  RiAddCircleLine
} from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import CiudadForm from "./CiudadForm";
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
import {
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineSearch,
  AiOutlinePlus,
} from "react-icons/ai";
import { appColors } from "../../utils/theme";
import { useUpdate } from "../../context/UpdateContext";

const Ciudades = () => {
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCiudad, setEditingCiudad] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("Nombre");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });
  const { updateFlags } = useUpdate();

  const fetchCiudades = async () => {
    try {
      setLoading(true);
      console.log("Iniciando petición de ciudades...");
      console.log("Parámetros de la petición:", {
        page: pagination.currentPage,
        perPage: pagination.perPage,
        search: searchTerm,
        sortField,
        sortDirection,
      });

      const response = await axiosInstance.get("/ciudades", {
        params: {
          page: pagination.currentPage,
          perPage: pagination.perPage,
          search: searchTerm,
          sortField,
          sortDirection,
        }
      });

      console.log("Respuesta completa:", response);

      // Transformar los datos para asegurar el formato correcto
      const ciudadesFormateadas = response.data.data.map(ciudad => ({
        IdCiudad: ciudad.id,
        Nombre: ciudad.nombre,
        Estado: ciudad.estado === "1"
      }));

      setCiudades(ciudadesFormateadas);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        perPage: response.data.per_page,
        total: response.data.total
      });

    } catch (error) {
      console.error("Error detallado al cargar ciudades:", error);
      console.error("Respuesta de error:", error.response);
      
      Swal.fire({
        icon: "error",
        title: "Error al cargar ciudades",
        text: error.response?.data?.message || "No se pudieron cargar las ciudades"
      });
      
      setCiudades([]);
      setPagination({
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCiudades();
  }, [pagination.currentPage, pagination.perPage, searchTerm, sortField, sortDirection, updateFlags.ciudades]);

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
      if (editingCiudad) {
        await axiosInstance.put(
          `/ciudades/${editingCiudad.IdCiudad}`,
          formData
        );
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Ciudad actualizada exitosamente",
        });
      } else {
        await axiosInstance.post("/ciudades", formData);
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Ciudad creada exitosamente",
        });
      }
      setShowForm(false);
      setEditingCiudad(null);
      fetchCiudades();
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar la solicitud",
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
        await axiosInstance.delete(`/ciudades/${id}`);
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Ciudad eliminada exitosamente",
        });
        fetchCiudades();
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la ciudad",
        });
      } finally {
        setLoadingAction(false);
      }
    }
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Ciudades</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-vml-red hover:bg-vml-red/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          onClick={() => {
            setEditingCiudad(null);
            setShowForm(true);
          }}
        >
          <RiAddLine />
          <span>Nueva Ciudad</span>
        </motion.button>
      </div>

      <div className="mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar ciudad..."
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
                <tr>
                  <td colSpan={3} align="center">
                    <div className="flex flex-col items-center justify-center py-4">
                      <FaSpinner className="animate-spin text-4xl text-vml-red mb-2" />
                      <p>Cargando...</p>
                    </div>
                  </td>
                </tr>
              ) : ciudades.length === 0 ? (
                <tr>
                  <td colSpan={3} align="center">
                    No se encontraron ciudades
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout" key={`ciudades-list-${pagination.currentPage}`}>
                  {ciudades.map((ciudad) => (
                    <motion.tr
                      key={`ciudad-${ciudad.IdCiudad}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{ciudad.Nombre}</td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-lg ${
                            ciudad.Estado
                              ? "bg-green-200 text-green-900 border border-green-400"
                              : "bg-red-200 text-red-900 border border-red-400"
                          }`}
                        >
                          {ciudad.Estado ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <LoadingButton
                            onClick={() => {
                              setEditingCiudad(ciudad);
                              setShowForm(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded-full transition-colors"
                            title="Editar"
                            loading={loadingAction}
                          >
                            <RiEditLine className="text-xl" />
                          </LoadingButton>

                          <LoadingButton
                            onClick={() => handleDelete(ciudad.IdCiudad)}
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

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <CiudadForm
              onSubmit={handleSubmit}
              initialData={editingCiudad}
              onCancel={() => {
                setShowForm(false);
                setEditingCiudad(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ciudades;
