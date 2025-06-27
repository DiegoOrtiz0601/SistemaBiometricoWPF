using BiomentricoHolding.Data.DataBaseRegistro_Test;
using BiomentricoHolding.Utils;
using Microsoft.Win32;
using System.Windows;
using System.Windows.Controls;

namespace BiomentricoHolding.Views.Configuracion
{
    public partial class ConfiguracionControl : UserControl
    {
        private readonly DataBaseRegistro_TestDbContext _context = AppSettings.GetContextUno();

        public ConfiguracionControl()
        {
            InitializeComponent();
            ConfiguracionSistema.CargarConfiguracion();
            CargarSedesDesdeBD();
            MostrarConfiguracionActual();
            MostrarLogEnPantalla();
            Logger.LogActualizado += MostrarLogEnPantalla;
        }

        private void CargarSedesDesdeBD()
        {
            try
            {
                var sedes = _context.Sedes.OrderBy(s => s.Nombre).ToList();
                cmbSedes.ItemsSource = sedes;
                cmbSedes.DisplayMemberPath = "Nombre";
                cmbSedes.SelectedValuePath = "IdSede";
            }
            catch (Exception ex)
            {
                Logger.Agregar("❌ Error al cargar las sedes: " + ex.Message);
                MostrarLogEnPantalla();
                MessageBox.Show("No se pudieron cargar las sedes.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void MostrarConfiguracionActual()
        {
            if (ConfiguracionSistema.EstaConfigurado)
            {
                cmbSedes.SelectedValue = ConfiguracionSistema.IdSedeActual;
                Logger.Agregar($"✔️ Sede actual cargada: {ConfiguracionSistema.NombreSedeActual}");
            }
        }

        private void BtnGuardarSede_Click(object sender, RoutedEventArgs e)
        {
            if (cmbSedes.SelectedItem is not Sede sedeSeleccionada)
            {
                MostrarToast("Sede guardada correctamente.");

                return;
            }

            ConfiguracionSistema.EstablecerConfiguracion(
     ConfiguracionSistema.IdEmpresaActual ?? 0,
     ConfiguracionSistema.NombreEmpresaActual ?? "Empresa desconocida",
     sedeSeleccionada.IdSede,
     sedeSeleccionada.Nombre
 );

            Logger.Agregar($"✅ Sede guardada: {sedeSeleccionada.Nombre}");
            MostrarLogEnPantalla();

            MessageBox.Show("Sede guardada correctamente.", "Éxito", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void BtnDescargarLog_Click(object sender, RoutedEventArgs e)
        {
            SaveFileDialog dlg = new SaveFileDialog
            {
                FileName = "log_sistema.txt",
                Filter = "Archivo de texto (*.txt)|*.txt"
            };

            if (dlg.ShowDialog() == true)
            {
                Logger.GuardarEnArchivo(dlg.FileName);
                MessageBox.Show("Log descargado correctamente.", "Log", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void MostrarLogEnPantalla()
        {
            txtLog.Text = Logger.ObtenerContenido();
            txtLog.ScrollToEnd();
        }

        private void BtnSalir_Click(object sender, RoutedEventArgs e)
        {
            Logger.LogActualizado -= MostrarLogEnPantalla;

            if (Application.Current.MainWindow is MainWindow mainWindow)
            {
                mainWindow.MostrarGifBienvenida();
            }
        }
        private async void MostrarToast(string mensaje)
        {
            ToastMessage.Text = mensaje;
            ToastContainer.Visibility = Visibility.Visible;

            await Task.Delay(3000); // Espera 3 segundos

            ToastContainer.Visibility = Visibility.Collapsed;
        }
        private void BtnLimpiarLog_Click(object sender, RoutedEventArgs e)
        {
            var resultado = MessageBox.Show("¿Estás seguro que deseas limpiar el log del sistema?", "Confirmar", MessageBoxButton.YesNo, MessageBoxImage.Warning);

            if (resultado == MessageBoxResult.Yes)
            {
                Logger.Limpiar();
                MostrarLogEnPantalla();
                MessageBox.Show("🧹 Log del sistema limpiado correctamente.", "Éxito", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

    }
}
