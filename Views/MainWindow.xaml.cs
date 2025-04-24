using BiomentricoHolding.Utils;
using BiomentricoHolding.Views;
using BiomentricoHolding.Views.Configuracion;
using BiomentricoHolding.Views.Empleado;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using WpfAnimatedGif;
using BiomentricoHolding.Views.Reportes;

namespace BiomentricoHolding
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            try
            {
                InitializeComponent();
                this.Loaded += MainWindow_Loaded; // mover la lógica aquí
            }
            catch (Exception ex)
            {
                MessageBox.Show("error construtor" + ex.ToString());
                throw;
            }
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                string gifPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "logo.gif");

                if (File.Exists(gifPath) && imgBienvenida != null)
                {
                    var image = new BitmapImage();
                    image.BeginInit();
                    image.UriSource = new Uri(gifPath, UriKind.Absolute);
                    image.CacheOption = BitmapCacheOption.OnLoad;
                    image.EndInit();

                    ImageBehavior.SetAnimatedSource(imgBienvenida, image);
                    ImageBehavior.SetRepeatBehavior(imgBienvenida, System.Windows.Media.Animation.RepeatBehavior.Forever);
                    ImageBehavior.SetAutoStart(imgBienvenida, true);

                    imgBienvenida.Visibility = Visibility.Visible;
                }
                else
                {
                    MessageBox.Show("❌ No se encontró el GIF o imgBienvenida es null.");
                    if (imgBienvenida != null)
                        imgBienvenida.Visibility = Visibility.Collapsed;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("❌ No se pudo cargar el GIF animado.\n\n" + ex.Message, "Error al cargar logo", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnRegistrarEmpleado_Click(object sender, RoutedEventArgs e)
        {
            var login = new MiniLoginWindow();
            bool? resultado = login.ShowDialog();

            if (resultado == true && login.AccesoPermitido)
            {
                MainContent.Content = new RegistrarEmpleado();
                imgBienvenida.Visibility = Visibility.Collapsed;
                MainContent.Visibility = Visibility.Visible;
            }
            
           
                else
                {
                    Logger.Agregar("🚫 Acceso denegado a Configuración");

                    var mensaje = new MensajeWindow("⚠️ Acceso denegado o cancelado.", false, "Cerrar", "")
                    {
                        Owner = this // 👉 Asegura que la ventana salga al frente
                    };

                    mensaje.ShowDialog();
                }
            
        }

        private void BtnControlAcceso_Click(object sender, RoutedEventArgs e)
        {
            CapturaEntradaSalidaWindow ventanaCaptura = new CapturaEntradaSalidaWindow();
            ventanaCaptura.ShowDialog();
        }

        private void BtnConsultarRegistros_Click(object sender, RoutedEventArgs e)
        {
            var login = new MiniLoginWindow();
            bool? resultado = login.ShowDialog();

            if (resultado == true && login.AccesoPermitido && login.IdUsuarioAutenticado == 12)
            {
                Logger.Agregar("📊 Acceso autorizado al módulo de Reportes por el usuario 12");
                MainContent.Content = new ReportesView();
                imgBienvenida.Visibility = Visibility.Collapsed;
                MainContent.Visibility = Visibility.Visible;
            }
            else
            {
                Logger.Agregar("🚫 Acceso denegado al módulo de Reportes");

                var mensaje = new MensajeWindow("⚠️ Solo el usuario autorizado puede acceder a esta sección.", false, "Cerrar", "")
                {
                    Owner = this // 👈 Asegura que el mensaje aparezca al frente
                };

                mensaje.ShowDialog();
            }

        }



        private void BtnConfiguracion_Click(object sender, RoutedEventArgs e)
        {
            var login = new MiniLoginWindow();
            bool? resultado = login.ShowDialog();

            if (resultado == true && login.AccesoPermitido)
            {
                Logger.Agregar("🔐 Acceso autorizado a Configuración");
                MainContent.Content = new ConfiguracionControl();
                imgBienvenida.Visibility = Visibility.Collapsed;
                MainContent.Visibility = Visibility.Visible;
            }
            else
            {
                Logger.Agregar("🚫 Acceso denegado a Configuración");

                var mensaje = new MensajeWindow("⚠️ Acceso denegado o cancelado.", false, "Cerrar", "")
                {
                    Owner = this // 👉 Asegura que la ventana salga al frente
                };

                mensaje.ShowDialog();
            }
        }




        private void BtnCerrarSesion_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }

        private void BarraTitulo_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Left)
                this.DragMove();
        }

        public void MostrarGifBienvenida()
        {
            if (FindName("imgBienvenida") is Image img)
            {
                string rutaGif = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "logo.gif");

                if (File.Exists(rutaGif))
                {
                    var image = new BitmapImage();
                    image.BeginInit();
                    image.UriSource = new Uri(rutaGif, UriKind.Absolute);
                    image.CacheOption = BitmapCacheOption.OnLoad;
                    image.EndInit();

                    ImageBehavior.SetAnimatedSource(img, image);
                    img.Visibility = Visibility.Visible;
                }

                if (FindName("MainContent") is ContentControl contenedor)
                {
                    contenedor.Content = null;
                    contenedor.Visibility = Visibility.Collapsed;
                }
            }
        }
    }
}
