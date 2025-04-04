using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using BiomentricoHolding.Models;
using BiomentricoHolding.Services;
using System.Collections.Generic;


namespace BiomentricoHolding.Views.Empleado
{
    /// <summary>
    /// Lógica de interacción para RegistrarEmpleado.xaml
    /// </summary>
    public partial class RegistrarEmpleado : UserControl

    {
        public RegistrarEmpleado()
        {
            InitializeComponent();
            CargarEmpresas();
        }
        private void CargarEmpresas()
        {
            List<Empresa> empresas = EmpresaService.ObtenerEmpresas();
            cbEmpresa.ItemsSource = empresas;
            cbEmpresa.DisplayMemberPath = "Nombre";
            cbEmpresa.SelectedValuePath = "IdEmpresa";
        }
        private void BtnRegistrar_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            MessageBox.Show("Botón REGISTRAR presionado");
            // Aquí irá la lógica para guardar el empleado
        }

        private void BtnCapturarHuella_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            MessageBox.Show("Captura de huella aún no implementada");
            // Aquí iría la lógica para usar el lector DigitalPersona
        }

        private void cbEmpresa_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // Aquí irá la lógica para cargar sedes al cambiar de empresa
            MessageBox.Show("Empresa seleccionada");
        }

        private void cbSede_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // Aquí irá la lógica para cargar áreas al cambiar de sede
            MessageBox.Show("Sede seleccionada");
        }


    }
}
