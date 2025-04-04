using Microsoft.Data.SqlClient;
using System.Windows;
using System.Windows.Media.Animation;
using BiomentricoHolding.Helpers;

namespace BiomentricoHolding.Views.Empleado
{
    public partial class MiniLoginWindow : Window
    {
        public bool AccesoPermitido { get; private set; } = false;

        public MiniLoginWindow()
        {
            InitializeComponent();
                     
        }

        private void BtnLogin_Click(object sender, RoutedEventArgs e)
        {
            string usuario = txtUsuario.Text.Trim();
            string clave = txtPassword.Password;

            if (ValidarUsuarioDesdeBD(usuario, clave))
            {
                AccesoPermitido = true;
                this.DialogResult = true;
                this.Close(); // <- Esto cierra la ventana correctamente
            }
            else
            {
                MessageBox.Show("Usuario o contraseña incorrectos o inactivo");
            }
        }

        private bool ValidarUsuarioDesdeBD(string usuario, string clave)
        {
            try
            {
                string connStr = AppSettings.GetConnectionString("MainDbConnection");

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();
                    string query = @"SELECT COUNT(*) FROM Usuario 
                                     WHERE NombreUsuario = @usuario 
                                     AND Contrasena = @clave 
                                     AND Estado = 1";

                    using (SqlCommand cmd = new SqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@usuario", usuario);
                        cmd.Parameters.AddWithValue("@clave", clave);

                        int count = (int)cmd.ExecuteScalar();
                        return count > 0;
                    }
                }
            }
            catch (SqlException ex)
            {
                MessageBox.Show("Error de conexión: " + ex.Message);
                return false;
            }
        }

        private void BtnCerrar_Click(object sender, RoutedEventArgs e)
        {
            this.DialogResult = false;
            this.Close(); // <- También aquí, cerrar correctamente
        }
    }
}
