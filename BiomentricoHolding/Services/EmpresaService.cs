using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using BiomentricoHolding.Helpers;
using BiomentricoHolding.Models;

namespace BiomentricoHolding.Services
{
    public static class EmpresaService
    {
        public static List<Empresa> ObtenerEmpresas()
        {
            List<Empresa> empresas = new List<Empresa>();

            string connStr = AppSettings.GetConnectionString("SecondaryDbConnection");

            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();
                string query = "SELECT IdEmpresa, Nombre FROM TblEmpresas";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        empresas.Add(new Empresa
                        {
                            IdEmpresa = reader.GetInt32(0),
                            Nombre = reader.GetString(1)
                        });
                    }
                }
            }

            return empresas;
        }
    }
}
