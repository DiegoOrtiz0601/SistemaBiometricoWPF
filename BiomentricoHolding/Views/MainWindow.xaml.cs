using BiomentricoHolding.Views.Empleado;
using System.Windows;

namespace BiomentricoHolding
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void BtnRegistrarEmpleado_Click(object sender, RoutedEventArgs e)
        {
            var login = new MiniLoginWindow();
            bool? resultado = login.ShowDialog();

            if (resultado == true && login.AccesoPermitido)
            {
                MainContent.Content = new RegistrarEmpleado(); // carga el módulo
            }
          
        }


        private void BtnControlAcceso_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Control de acceso");
        }

        private void BtnConsultarRegistros_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Consultar registros");
        }

        private void BtnConfiguracion_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Configuración del sistema");
        }

        private void BtnCerrarSesion_Click(object sender, RoutedEventArgs e)
        {
            this.Close(); // o regresar al LoginWindow
        }
    }
}
