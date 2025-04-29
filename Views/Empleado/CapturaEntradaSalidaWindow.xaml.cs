using BiomentricoHolding.Data.DataBaseRegistro_Test;
using BiomentricoHolding.Services;
using BiomentricoHolding.Utils;
using DPFP;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using EmpleadoModel = BiomentricoHolding.Data.DataBaseRegistro_Test.Empleado;

namespace BiomentricoHolding.Views.Empleado
{
    public partial class CapturaEntradaSalidaWindow : Window
    {
        private DispatcherTimer _timer;
        private readonly CapturaHuellaService _capturaService = new();

        public CapturaEntradaSalidaWindow()
        {
            InitializeComponent();
            Logger.Agregar("📡 Iniciando módulo de verificación de huella.");

            IniciarReloj();
            ConfigurarEventosHuella();
        }

        private void IniciarReloj()
        {
            _timer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };
            _timer.Tick += (s, e) =>
            {
                var cultura = new CultureInfo("es-CO");
                txtReloj.Text = DateTime.Now.ToString("HH:mm:ss", cultura);
                txtFecha.Text = DateTime.Now.ToString("dddd, dd MMMM yyyy", cultura).ToUpper();
            };
            _timer.Start();
        }

        private void ConfigurarEventosHuella()
        {
            _capturaService.Modo = ModoCaptura.Verificacion;
            _capturaService.Mensaje += MostrarMensaje;
            _capturaService.MuestraProcesada += ProcesarHuellaVerificacion;
            _capturaService.MuestraProcesadaImagen += MostrarImagenHuella;
            _capturaService.IniciarCaptura();
        }

        private void BtnReiniciar_Click(object sender, RoutedEventArgs e)
        {
            LimpiarFormulario();
            _capturaService.DetenerCaptura();
            _capturaService.IniciarCaptura();
        }

        private void LimpiarFormulario()
        {
            txtEstadoHuella.Text = "Por favor coloque su dedo en el lector";
            lblNombreEmpleado.Text = "Nombre: ---";
            lblDocumento.Text = "Documento: ---";
            lblTipoMarcacion.Text = "Marcación: ---";
            lblEstadoMarcacion.Text = "Estado: ---";
            imgHuella.Source = null;
        }

        private void MostrarMensaje(string mensaje)
        {
            Dispatcher.Invoke(() => txtEstadoHuella.Text = mensaje);
        }

        private void MostrarImagenHuella(Bitmap imagen)
        {
            Dispatcher.Invoke(() =>
            {
                imgHuella.Source = ConvertirBitmapToImageSource(imagen);
            });
        }

        private ImageSource ConvertirBitmapToImageSource(Bitmap bitmap)
        {
            using var memory = new MemoryStream();
            bitmap.Save(memory, System.Drawing.Imaging.ImageFormat.Bmp);
            memory.Position = 0;
            var bitmapImage = new BitmapImage();
            bitmapImage.BeginInit();
            bitmapImage.StreamSource = memory;
            bitmapImage.CacheOption = BitmapCacheOption.OnLoad;
            bitmapImage.EndInit();
            return bitmapImage;
        }

        private void ProcesarHuellaVerificacion(Sample sample)
        {
            _capturaService.DetenerCaptura();

            MensajeWindow buscandoWindow = null;

            Dispatcher.Invoke(() =>
            {
                Logger.Agregar("🧠 Procesando muestra de huella digital...");

                var extractor = new DPFP.Processing.FeatureExtraction();
                var feedback = DPFP.Capture.CaptureFeedback.None;
                FeatureSet features = new FeatureSet();
                extractor.CreateFeatureSet(sample, DPFP.Processing.DataPurpose.Verification, ref feedback, ref features);

                if (features == null || feedback != DPFP.Capture.CaptureFeedback.Good)
                {
                    Logger.Agregar("❌ No se pudo leer la huella correctamente.");
                    MostrarMensaje("❌ No se pudo leer la huella correctamente.");
                    _capturaService.IniciarCaptura();
                    return;
                }

                buscandoWindow = new MensajeWindow("🔍 Buscando huella...", false, true);
                buscandoWindow.Show();

                using var db = new DataBaseRegistro_TestDbContext();
                var empleados = db.Empleados.Where(e => e.Huella != null && e.Estado == true).ToList();
                var verificador = new DPFP.Verification.Verification();
                var resultado = new DPFP.Verification.Verification.Result();

                foreach (var empleado in empleados)
                {
                    try
                    {
                        var templateBD = new Template(new MemoryStream(empleado.Huella));
                        verificador.Verify(features, templateBD, ref resultado);

                        if (resultado.Verified)
                        {
                            Logger.Agregar($"✅ Huella verificada: {empleado.Nombres} {empleado.Apellidos} ({empleado.Documento})");
                            buscandoWindow?.Close();
                            MostrarDatosEmpleado(empleado);
                            Dispatcher.InvokeAsync(() => DeterminarTipoMarcacion(empleado));
                            return;
                        }
                    }
                    catch (Exception ex)
                    {
                        Logger.Agregar($"❌ Error verificando huella: {ex.Message}");
                        buscandoWindow?.Close();
                        MostrarMensaje("❌ Error verificando huella: " + ex.Message);
                        LimpiarFormulario();
                        _capturaService.IniciarCaptura();
                        return;
                    }
                }

                Logger.Agregar("❌ Huella no coincide con ningún empleado registrado.");
                buscandoWindow?.Close();

                Dispatcher.BeginInvoke(() =>
                {
                    MostrarMensaje("❌ Huella no coincide con ningún empleado.");
                    new MensajeWindow("❌ Huella no coincide con ningún empleado. Por favor intente nuevamente", 3, "error").Show();
                    _capturaService.IniciarCaptura();
                });
            });
        }

        private void MostrarDatosEmpleado(EmpleadoModel empleado)
        {
            lblNombreEmpleado.Text = $"Nombre: {empleado.Nombres} {empleado.Apellidos}";
            lblDocumento.Text = $"Documento: {empleado.Documento}";
            lblTipoMarcacion.Text = "Procesando...";
            lblEstadoMarcacion.Text = "---";
        }

        private void DeterminarTipoMarcacion(EmpleadoModel empleado)
        {
            Dispatcher.Invoke(() =>
            {
                try
                {
                    using var db = new DataBaseRegistro_TestDbContext();

                    var hoy = DateTime.Now;
                    var diaSemana = (int)hoy.DayOfWeek;
                    if (diaSemana == 0) diaSemana = 7;

                    var asignacion = db.AsignacionHorarios
                        .FirstOrDefault(a => a.IdEmpleado == empleado.IdEmpleado && a.Estado);

                    if (asignacion == null)
                    {
                        Logger.Agregar($"⚠️ {empleado.Nombres} no tiene una asignación de horario activa.");
                        MostrarMensaje("⚠ No hay horario asignado. Contacte al administrador.");
                        LimpiarFormulario();
                        _capturaService.IniciarCaptura();
                        return;
                    }

                    var detalle = db.DetalleHorarios
                        .FirstOrDefault(d => d.IdAsignacion == asignacion.Id && d.DiaSemana == diaSemana);

                    if (detalle == null)
                    {
                        Logger.Agregar($"⚠️ No se encontró detalle de horario para el día {diaSemana}.");
                        MostrarMensaje("⚠ No hay horario configurado para hoy.");
                        LimpiarFormulario();
                        _capturaService.IniciarCaptura();
                        return;
                    }

                    TimeOnly horaActual = TimeOnly.FromDateTime(hoy);
                    TimeOnly entrada = detalle.HoraInicio;
                    TimeOnly salida = detalle.HoraFin;

                    var yaMarcoHoy = db.Marcaciones.Any(m =>
                        m.IdEmpleado == empleado.IdEmpleado &&
                        m.FechaHora.Date == hoy.Date);

                    int tipoMarcacion;
                    string tipoTexto;

                    if (!yaMarcoHoy)
                    {
                        tipoMarcacion = 1;
                        tipoTexto = "Entrada";
                    }
                    else if (horaActual >= entrada.AddHours(-1) && horaActual <= entrada.AddHours(1))
                    {
                        tipoMarcacion = 1;
                        tipoTexto = "Entrada";
                    }
                    else if (horaActual >= salida.AddHours(-1) && horaActual <= salida.AddHours(1))
                    {
                        tipoMarcacion = 2;
                        tipoTexto = "Salida";
                    }
                    else
                    {
                        tipoMarcacion = 3;
                        tipoTexto = "Novedad";
                    }

                    var cincoMinutosAtras = hoy.AddMinutes(-5);
                    var ultima = db.Marcaciones
                        .Where(m => m.IdEmpleado == empleado.IdEmpleado && m.FechaHora >= cincoMinutosAtras)
                        .OrderByDescending(m => m.FechaHora)
                        .FirstOrDefault();

                    if (ultima != null)
                    {
                        var diferencia = hoy - ultima.FechaHora;
                        MostrarMensaje($"⚠ Marcó hace {diferencia.Minutes} min {diferencia.Seconds} seg. Espere 5 min.");
                        LimpiarFormulario();
                        _capturaService.IniciarCaptura();
                        return;
                    }

                    var marcacion = new Marcacione
                    {
                        IdEmpleado = empleado.IdEmpleado,
                        FechaHora = hoy,
                        IdEmpresa = empleado.IdEmpresa,
                        IdSede = ConfiguracionSistema.IdSedeActual ?? empleado.IdSede,
                        IdTipoMarcacion = tipoMarcacion,
                        IdAsignacion = asignacion.Id
                    };

                    db.Marcaciones.Add(marcacion);
                    db.SaveChanges();

                    lblTipoMarcacion.Text = tipoTexto;
                    lblEstadoMarcacion.Text = "✔ Registrado";

                    Logger.Agregar($"📝 {tipoTexto} registrada para {empleado.Nombres} ({empleado.Documento})");

                    new MensajeWindow($"✅ {tipoTexto} registrada\nHora: {hoy:HH:mm:ss}", 3).Show();
                }
                catch (Exception ex)
                {
                    Logger.Agregar($"❌ Error en marcación: {ex.Message}");
                    MostrarMensaje("❌ Error al registrar marcación.");
                    LimpiarFormulario();
                }
                finally
                {
                    _capturaService.IniciarCaptura();
                }
            });
        }

        protected override void OnClosed(EventArgs e)
        {
            _capturaService.DetenerCaptura();
            base.OnClosed(e);
        }
    }
}
