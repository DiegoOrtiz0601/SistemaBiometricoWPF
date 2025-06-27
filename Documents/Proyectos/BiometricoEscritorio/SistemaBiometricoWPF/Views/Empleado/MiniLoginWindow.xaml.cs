using BiomentricoHolding.Utils;
using System.Linq;
using System.Windows;

namespace BiomentricoHolding.Views.Empleado
{
    public partial class MiniLoginWindow : Window
    {
        public int IdUsuarioAutenticado { get; private set; }
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
                this.Close(); // Cierra correctamente la ventana
            }
            else
            {
                var mensaje = new MensajeWindow("❌ Usuario o contraseña incorrectos o el usuario está inactivo.", false, "Cerrar", "")
                {
                    Owner = this // 👉 Esto asegura que se muestre al frente
                };

                mensaje.ShowDialog();
            }

        }

        private bool ValidarUsuarioDesdeBD(string usuario, string clave)
        {
            try
            {
                using (var context = AppSettings.GetContextUno())
                {
                    var usuarioValido = context.Usuarios.FirstOrDefault(u =>
                        u.NombreUsuario == usuario &&
                        u.Contrasena == clave &&
                        u.Estado == true
                    );

                    if (usuarioValido != null)
                    {
                        IdUsuarioAutenticado = usuarioValido.IdUsuario;

                        // 👇 Asigna el objeto completo al sistema de sesión
                        SesionSistema.UsuarioActual = usuarioValido;

                        return true;
                    }

                    return false;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error al validar usuario: " + ex.Message);
                return false;
            }
        }

        private void BtnCerrar_Click(object sender, RoutedEventArgs e)
        {
            var confirmar = new MensajeWindow("⚠ ¿Deseas cerrar esta ventana?", 0, "advertencia")
            {
                Owner = this
            };

            // Agregar botones personalizados manualmente
            var decision = new MensajeWindow("⚠ ¿Deseas cerrar esta ventana?", true, "Cerrar", "Cancelar");
            decision.Owner = this;
            bool? resultado = decision.ShowDialog();

            if (resultado == true && decision.Resultado)
            {
                this.DialogResult = false;
                this.Close();
            }
            else
            {
                // Usuario canceló, no se cierra la ventana
            }
        }

    }
}
