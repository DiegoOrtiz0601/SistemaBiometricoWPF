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
using System.Media;
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

        private async void BtnReiniciar_Click(object sender, RoutedEventArgs e)
        {
            await ReiniciarCaptura();
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

            Dispatcher.Invoke(async () =>
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
                    ReproducirSonido("Sonidos/error.wav");

                    new MensajeWindow("❌ Lectura de huella inválida. Intente nuevamente.", 2, "error")
                    {
                        Owner = this,
                        WindowStartupLocation = WindowStartupLocation.CenterOwner
                    }.ShowDialog();
                    await ReiniciarCaptura();
                    return;
                }

                buscandoWindow = new MensajeWindow("🔍 Buscando huella...", false, true);
                buscandoWindow.Show();

                using var db = AppSettings.GetContextUno();
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
                            ReproducirSonido("Sonidos/correcto.wav");
                            Dispatcher.InvokeAsync(() => DeterminarTipoMarcacion(empleado));
                            return;
                        }
                    }
                    catch (Exception ex)
                    {
                        Logger.Agregar($"❌ Error verificando huella: {ex.Message}");
                        buscandoWindow?.Close();
                        // 🔊 Reproducir sonido ANTES de limpiar o reiniciar
                        ReproducirSonido("Sonidos/error.wav");

                        new MensajeWindow("❌ Error al verificar la huella. Intente nuevamente.", 2, "error")
                        {
                            Owner = this,
                            WindowStartupLocation = WindowStartupLocation.CenterOwner
                        }.ShowDialog();

                        MostrarMensaje("❌ Error verificando huella.");

                        

                        await ReiniciarCaptura(); // Dentro de este método está LimpiarFormulario()
                        return;
                    }

                }

                Logger.Agregar("❌ Huella no coincide con ningún empleado registrado.");
                buscandoWindow?.Close();

                Dispatcher.BeginInvoke(async () =>
                {
                    MostrarMensaje("❌ Huella no coincide con ningún empleado.");
                    ReproducirSonido("Sonidos/error.wav");
                    new MensajeWindow(
                        "❌ Huella no reconocida.\nPor favor coloque su dedo nuevamente en el lector.", 2, "advertencia")
                    {
                        Owner = this,
                        WindowStartupLocation = WindowStartupLocation.CenterOwner
                    }.ShowDialog();

                    await ReiniciarCaptura();
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
            Dispatcher.InvokeAsync(async() =>
            {
                try
                {
                    using var db = AppSettings.GetContextUno();

                    var hoy = DateTime.Now;
                    var diaSemana = (int)hoy.DayOfWeek;
                    diaSemana = diaSemana == 0 ? 1 : diaSemana + 1;

                    var asignacion = db.AsignacionHorarios
                        .FirstOrDefault(a => a.IdEmpleado == empleado.IdEmpleado && a.Estado);

                    if (asignacion == null)
                    {
                        Logger.Agregar($"⚠️ {empleado.Nombres} no tiene una asignación de horario activa.");
                        ReproducirSonido("Sonidos/advertencia.wav");
                        new MensajeWindow("⚠ No hay horario asignado para este colaborador.\nContacte al administrador.", 2, "advertencia")
                        {
                            Owner = this,
                            WindowStartupLocation = WindowStartupLocation.CenterOwner
                        }.ShowDialog();
                        await ReiniciarCaptura();
                        return;

                    }

                    var detalle = db.DetalleHorarios
                        .FirstOrDefault(d => d.IdAsignacion == asignacion.Id && d.DiaSemana == diaSemana);

                    if (detalle == null)
                    {
                        Logger.Agregar($"⚠️ No se encontró detalle de horario para el día {diaSemana}.");

                        var ventana = new MensajeWindow("⚠ No hay horario configurado para hoy.", 3, "advertencia")
                        {
                            Owner = this,
                            WindowStartupLocation = WindowStartupLocation.CenterOwner
                        };
                        ventana.Closed += async (s, e) =>
                        {
                            await ReiniciarCaptura();
                        };
                        ventana.ShowDialog();
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
                    // Si está dentro del rango de salida o después de la salida → Salida
                    if (horaActual >= salida.AddHours(-1))
                    {
                        tipoMarcacion = 2;
                        tipoTexto = "Salida";
                    }
                    else if (!yaMarcoHoy)
                    {
                        tipoMarcacion = 1;
                        tipoTexto = "Entrada";
                    }
                    else
                    {
                        tipoMarcacion = 3;
                        tipoTexto = "Novedad";
                        Logger.Agregar($"⚠️ {empleado.Nombres} realizó una marcación fuera de horario. Se registrará como NOVEDAD.");
                    }




                    var cincoMinutosAtras = hoy.AddMinutes(-5);

                    var ultima = db.Marcaciones
                    .Where(m => m.IdEmpleado == empleado.IdEmpleado && m.FechaHora >= cincoMinutosAtras)
                     .OrderByDescending(m => m.FechaHora)
                    .FirstOrDefault();

                    if (ultima != null)
                    {
                        var diferencia = hoy - ultima.FechaHora;
                        string mensaje = $"⚠ {empleado.Nombres} ya marcó hace {diferencia.Minutes} min {diferencia.Seconds} seg.\n⏳ Debe esperar 5 minutos.";
                        Logger.Agregar(mensaje);
                        ReproducirSonido("Sonidos/advertencia.wav");

                        new MensajeWindow(mensaje, 2, "advertencia")
                        {
                            Owner = this,
                            WindowStartupLocation = WindowStartupLocation.CenterOwner
                        }.ShowDialog();

                        await ReiniciarCaptura();
                        return;
                    }


                    if (!ConfiguracionSistema.EstaConfigurado)
                    {
                        new MensajeWindow("⚠ La empresa y sede no están configuradas.\nNo se puede registrar la marcación.", 3, "error").ShowDialog();
                        return;
                    }

                    var marcacion = new Marcacione
                    {
                        IdEmpleado = empleado.IdEmpleado,
                        FechaHora = hoy,
                        IdEmpresa = empleado.IdEmpresa,
                        IdSede = ConfiguracionSistema.IdSedeActual.Value,
                        IdTipoMarcacion = tipoMarcacion,
                        IdAsignacion = asignacion.Id
                    };

                    db.Marcaciones.Add(marcacion);
                    db.SaveChanges();

                    lblTipoMarcacion.Text = tipoTexto;
                    lblEstadoMarcacion.Text = "✔ Registrado";

                    Logger.Agregar($"📝 {tipoTexto} registrada para {empleado.Nombres} ({empleado.Documento})");

                    var ventanaConfirmacion = new MensajeWindow($"✅ {tipoTexto} registrada\nHora: {hoy:HH:mm:ss}", 2);
                    ventanaConfirmacion.Closed += async (s, e) =>
                    {
                        await ReiniciarCaptura();
                    };
                    ventanaConfirmacion.Show();

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
        private async Task ReiniciarCaptura()
        {
            LimpiarFormulario();
            await Task.Delay(500);
            _capturaService.IniciarCaptura();
        }

        protected override void OnClosed(EventArgs e)
        {
            _capturaService.DetenerCaptura();
            base.OnClosed(e);
        }

        private void ReproducirSonido(string archivo)
        {
            try
            {
                SoundPlayer player = new SoundPlayer(archivo);
                player.Play();
            }
            catch (Exception ex)
            {
                Logger.Agregar("Error al reproducir sonido: " + ex.Message);
            }
        }
    }
}
