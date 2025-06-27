using Microsoft.Data.SqlClient;
using System.Windows;


namespace BiomentricoHolding.Services
{
    public static class ConnectionTester
    {
        public static void TestConnections()
        {
            try
            {
                // Obtener cadenas de appsettings.json y limpiar espacios invisibles
                string conn1 = AppSettings.GetConnectionString("MainDbConnection")?.Trim() ?? "";
                string conn2 = AppSettings.GetConnectionString("SecondaryDbConnection")?.Trim() ?? "";

                conn1 = conn1.Replace("\r", "").Replace("\n", "").Replace("\"", "");
                conn2 = conn2.Replace("\r", "").Replace("\n", "").Replace("\"", "");

                if (string.IsNullOrWhiteSpace(conn1) || string.IsNullOrWhiteSpace(conn2))
                {
                    MessageBox.Show("❌ Error: Alguna cadena de conexión es inválida o está vacía.");
                    return;
                }

                using (SqlConnection sql = new SqlConnection(conn1))
                {
                    sql.Open();
                    MessageBox.Show("✅ Conexión a BD principal exitosa.");
                }

                using (SqlConnection sql = new SqlConnection(conn2))
                {
                    sql.Open();
                    MessageBox.Show("✅ Conexión a BD secundaria exitosa.");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("❌ Error de conexión: " + ex.Message);
            }
        }
    }
}
