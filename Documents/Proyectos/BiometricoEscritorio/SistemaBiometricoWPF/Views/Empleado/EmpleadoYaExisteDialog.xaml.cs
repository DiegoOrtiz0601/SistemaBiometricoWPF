using System.Windows;

namespace BiomentricoHolding.Views.Empleado
{

    public partial class EmpleadoYaExisteDialog : Window
    {
        public bool Modificar { get; private set; } = false;

        public EmpleadoYaExisteDialog(string cedula)
        {
            InitializeComponent();
            txtMensaje.Text = $"El empleado con cédula {cedula} ya está registrado.\n\n¿Qué deseas hacer?";
        }

        private void BtnModificar_Click(object sender, RoutedEventArgs e)
        {
            Modificar = true;
            this.DialogResult = true;
        }

        private void BtnCerrar_Click(object sender, RoutedEventArgs e)
        {
            this.DialogResult = false;
        }
    }
}
