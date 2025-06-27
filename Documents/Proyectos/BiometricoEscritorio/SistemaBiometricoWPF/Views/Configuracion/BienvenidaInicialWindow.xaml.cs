using BiomentricoHolding.Views.Empleado;
using System.Windows;

namespace BiomentricoHolding.Views.Configuracion
{
    public partial class BienvenidaInicialWindow : Window
    {
        public BienvenidaInicialWindow()
        {
            InitializeComponent();
        }

        private void BtnIniciarConfiguracion_Click(object sender, RoutedEventArgs e)
        {
            // Mostrar login
            var login = new MiniLoginWindow();
            bool? resultado = login.ShowDialog();

            if (resultado == true && login.AccesoPermitido)
            {
                // Mostrar selección de empresa y sede
                var seleccion = new SeleccionEmpresaSedeWindow();
                bool? configurado = seleccion.ShowDialog();

                if (configurado == true)
                {
                    // Ya se guardó la configuración global
                    this.DialogResult = true;
                    this.Close(); ;
                }
                else
                {
                    MessageBox.Show("No se completó la configuración. El sistema no puede continuar.", "Advertencia", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
            else
            {
                MessageBox.Show("Acceso denegado.", "Login fallido", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
