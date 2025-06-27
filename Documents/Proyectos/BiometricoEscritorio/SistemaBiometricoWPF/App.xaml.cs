using BiomentricoHolding.Utils;
using BiomentricoHolding.Views.Configuracion;
using System.Windows;

namespace BiomentricoHolding
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            try
            {
                base.OnStartup(e);
                ShutdownMode = ShutdownMode.OnExplicitShutdown;

                // 1. Intentar cargar configuración
                ConfiguracionSistema.CargarConfiguracion();

                // 2. Si no hay configuración, abrir ventana de bienvenida
                if (!ConfiguracionSistema.EstaConfigurado)
                {

                    var bienvenida = new BienvenidaInicialWindow();
                    MainWindow = bienvenida;
                    bool? resultado = bienvenida.ShowDialog();

                    // 3. Volver a cargar configuración por si fue guardada dentro del flujo
                    ConfiguracionSistema.CargarConfiguracion();



                    // 4. Si aún no está configurado, cerrar la app
                    if (resultado != true || !ConfiguracionSistema.EstaConfigurado)
                    {
                        MessageBox.Show("❌ El sistema no puede iniciar sin configuración.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);

                        return;
                    }
                }

                // 5. Cargar MainWindow si todo está bien



                MainWindow = new MainWindow();
                MainWindow.Show();

                DispatcherUnhandledException += (sender, args) =>
                {
                    MessageBox.Show("💥 Excepción no controlada:\n\n" +
                   $"Mensaje: {args.Exception.Message}\n\n" +
                   $"StackTrace:\n{args.Exception.StackTrace}",
                   "ERROR",
                   MessageBoxButton.OK,
                   MessageBoxImage.Error);
                    args.Handled = true;
                };
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error crítico: {ex.Message}", "ERROR", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
