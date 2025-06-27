using BiomentricoHolding.Data.DataBaseRegistro_Test;
using BiomentricoHolding.Services;
using BiomentricoHolding.Utils;
using System.Drawing;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Imaging;
using EmpleadoModel = BiomentricoHolding.Data.DataBaseRegistro_Test.Empleado;

namespace BiomentricoHolding.Views.Empleado
{
    public partial class RegistrarEmpleado : UserControl
    {
        private DPFP.Template _huellaCapturada = null;
        private bool esModificacion = false;
        private int idEmpleadoActual = 0;

        public RegistrarEmpleado()
        {
            InitializeComponent();
            Logger.Agregar("🔄 Abriendo formulario de Registro de Empleado");
            CargarEmpresas();
            CargarTiposEmpleado();
        }

        private void CargarEmpresas()
        {
            using var context = AppSettings.GetContextUno();
            cbEmpresa.ItemsSource = context.Empresas.OrderBy(e => e.Nombre).ToList();
            cbEmpresa.DisplayMemberPath = "Nombre";
            cbEmpresa.SelectedValuePath = "IdEmpresa";
        }

        private void CargarTiposEmpleado()
        {
            using var context = AppSettings.GetContextUno();
            cbTipoEmpleado.ItemsSource = context.TiposEmpleados.Where(t => t.Estado).OrderBy(t => t.Nombre).ToList();
            cbTipoEmpleado.DisplayMemberPath = "Nombre";
            cbTipoEmpleado.SelectedValuePath = "Id";
        }

        private void cbEmpresa_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            cbSede.ItemsSource = null;
            cbArea.ItemsSource = null;

            if (cbEmpresa.SelectedValue is int idEmpresa)
            {
                Logger.Agregar($"🏢 Empresa seleccionada: ID {idEmpresa}");
                using var context = AppSettings.GetContextUno();
                cbSede.ItemsSource = context.Sedes.Where(s => s.IdEmpresa == idEmpresa).OrderBy(s => s.Nombre).ToList();
                cbSede.DisplayMemberPath = "Nombre";
                cbSede.SelectedValuePath = "IdSede";
            }
        }

        private void cbSede_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            cbArea.ItemsSource = null;

            if (cbSede.SelectedValue is int idSede)
            {
                Logger.Agregar($"📍 Sede seleccionada: ID {idSede}");
                using var context = AppSettings.GetContextUno();
                cbArea.ItemsSource = context.Areas.Where(a => a.IdSede == idSede).OrderBy(a => a.Nombre).ToList();
                cbArea.DisplayMemberPath = "Nombre";
                cbArea.SelectedValuePath = "IdArea";
            }
        }

        private void txtCedula_LostFocus(object sender, RoutedEventArgs e)
        {
            string cedulaTexto = txtCedula.Text.Trim();
            var icon = (TextBlock)this.FindName("iconCedulaCheck");

            if (string.IsNullOrWhiteSpace(cedulaTexto))
            {
                icon.Visibility = Visibility.Collapsed;
                return;
            }

            if (int.TryParse(cedulaTexto, out int cedula))
            {
                if (CedulaExiste(cedula))
                {
                    icon.Visibility = Visibility.Collapsed;
                    MostrarModalUsuarioYaExiste(cedulaTexto);
                }
                else
                {
                    icon.Visibility = Visibility.Visible;
                }
            }
            else
            {
                new MensajeWindow("⚠ La cédula ingresada no es válida.", false, "Entendido", "").ShowDialog();
                icon.Visibility = Visibility.Collapsed;
            }
        }

        private bool CedulaExiste(int cedula)
        {
            using var context = AppSettings.GetContextUno();
            return context.Empleados.Any(e => e.Documento == cedula);
        }

        private void MostrarModalUsuarioYaExiste(string cedulaTexto)
        {
            var modal = new EmpleadoYaExisteDialog(cedulaTexto);
            bool? result = modal.ShowDialog();

            if (result == true && modal.Modificar)
            {
                Logger.Agregar($"✏️ Usuario con cédula {cedulaTexto} desea modificar datos.");
                if (int.TryParse(cedulaTexto, out int cedula))
                {
                    using var context = AppSettings.GetContextUno();
                    var empleado = context.Empleados.FirstOrDefault(e => e.Documento == cedula);
                    if (empleado != null)
                    {
                        esModificacion = true;
                        idEmpleadoActual = empleado.IdEmpleado;

                        txtTituloFormulario.Text = "✏️ Actualización de Empleado";
                        btnRegistrar.Content = "💾 Actualizar";

                        txtNombres.Text = empleado.Nombres;
                        txtApellidos.Text = empleado.Apellidos;
                        txtCedula.Text = empleado.Documento.ToString();
                        cbEmpresa.SelectedValue = empleado.IdEmpresa;
                        cbTipoEmpleado.SelectedValue = empleado.IdTipoEmpleado;

                        cbEmpresa_SelectionChanged(null, null);
                        cbSede.SelectedValue = empleado.IdSede;

                        cbSede_SelectionChanged(null, null);
                        cbArea.SelectedValue = empleado.IdArea;

                        if (empleado.Huella != null)
                        {
                            _huellaCapturada = new DPFP.Template(new MemoryStream(empleado.Huella));
                            Logger.Agregar("🧬 Huella digital cargada desde base de datos");
                        }

                        Logger.Agregar($"📄 Datos cargados para modificar empleado ID: {empleado.IdEmpleado}");
                    }
                }
            }
        }
        private void BtnRegistrar_Click(object sender, RoutedEventArgs e)
        {
            Logger.Agregar($"📥 [{SesionSistema.NombreUsuario}] Botón Registrar presionado");

            if (string.IsNullOrWhiteSpace(txtNombres.Text) ||
                string.IsNullOrWhiteSpace(txtApellidos.Text) ||
                string.IsNullOrWhiteSpace(txtCedula.Text) ||
                cbEmpresa.SelectedItem == null ||
                cbSede.SelectedItem == null ||
                cbArea.SelectedItem == null ||
                cbTipoEmpleado.SelectedItem == null)
            {
                new MensajeWindow("⚠️ Todos los campos son obligatorios.", false, "Entendido", "").ShowDialog();
                return;
            }

            if (_huellaCapturada == null)
            {
                new MensajeWindow("🛑 Debes capturar la huella antes de continuar.", false, "Entendido", "").ShowDialog();
                return;
            }

            try
            {
                int cedula = int.Parse(txtCedula.Text.Trim());
                byte[] huellaBytes = HuellaHelper.ConvertirTemplateABytes(_huellaCapturada);

                using var context = AppSettings.GetContextUno();
                EmpleadoModel empleado;

                if (esModificacion && idEmpleadoActual > 0)
                {
                    empleado = context.Empleados.FirstOrDefault(e => e.IdEmpleado == idEmpleadoActual);
                    if (empleado == null)
                    {
                        new MensajeWindow("❌ No se encontró el empleado para modificar.", false, "Cerrar", "").ShowDialog();
                        return;
                    }

                    empleado.Nombres = txtNombres.Text.Trim();
                    empleado.Apellidos = txtApellidos.Text.Trim();
                    empleado.Documento = cedula;
                    empleado.IdEmpresa = (int)cbEmpresa.SelectedValue;
                    empleado.IdSede = (int)cbSede.SelectedValue;
                    empleado.IdArea = (int)cbArea.SelectedValue;
                    empleado.IdTipoEmpleado = (int)cbTipoEmpleado.SelectedValue;
                    empleado.Huella = huellaBytes;
                    empleado.FechaIngreso = DateTime.Now;
                    empleado.Estado = true;  // 🔥 AGREGA ESTA LÍNEA AQUÍ

                    Logger.Agregar($"✏️ [{SesionSistema.NombreUsuario}] Modificando empleado ID {empleado.IdEmpleado}");
                }
                else
                {
                    empleado = new EmpleadoModel
                    {
                        Documento = cedula,
                        Nombres = txtNombres.Text.Trim(),
                        Apellidos = txtApellidos.Text.Trim(),
                        IdEmpresa = (int)cbEmpresa.SelectedValue,
                        IdSede = (int)cbSede.SelectedValue,
                        IdArea = (int)cbArea.SelectedValue,
                        IdTipoEmpleado = (int)cbTipoEmpleado.SelectedValue,
                        Huella = huellaBytes,
                        Estado = true,
                        FechaIngreso = DateTime.Now,
                        IdUsuario = SesionSistema.IdUsuarioActual
                    };

                    context.Empleados.Add(empleado);
                    context.SaveChanges();
                    idEmpleadoActual = empleado.IdEmpleado;

                    Logger.Agregar($"🆕 [{SesionSistema.NombreUsuario}] Nuevo empleado registrado: {empleado.Nombres} {empleado.Apellidos} ({empleado.Documento})");
                }

                context.SaveChanges();

                int idEmpleado = empleado.IdEmpleado;
                int idTipoEmpleado = (int)cbTipoEmpleado.SelectedValue;
                string nombreTipoEmpleado = context.TiposEmpleados.FirstOrDefault(t => t.Id == idTipoEmpleado)?.Nombre ?? "";
                bool esRotativo = nombreTipoEmpleado.Trim().ToLower() == "enrolado rotativo";

                var asignacionExistente = context.AsignacionHorarios.FirstOrDefault(a => a.IdEmpleado == idEmpleado && a.Estado);
                bool usarHorarioEspecifico = false;

                if (asignacionExistente != null)
                {
                    string mensaje = esRotativo
                        ? "Ya existe un horario activo. ¿Deseas reemplazarlo por un horario específico o mantener el actual?"
                        : "Ya existe un horario activo. ¿Deseas reemplazarlo por un horario genérico o mantener el actual?";

                    var decision = new MensajeWindow(mensaje, true, "Reemplazar", "Mantener");
                    bool? resultado = decision.ShowDialog();

                    if (resultado == true && decision.Resultado)
                    {
                        asignacionExistente.Estado = false;
                        usarHorarioEspecifico = esRotativo;
                        Logger.Agregar($"🔁 [{SesionSistema.NombreUsuario}] Reemplazando horario activo para empleado ID {idEmpleado}");
                    }
                    else
                    {
                        Logger.Agregar($"✅ [{SesionSistema.NombreUsuario}] Se mantuvo el horario actual para empleado ID {idEmpleado}");
                        FinalizarGuardado(esModificacion);
                        return;
                    }
                }
                else
                {
                    string mensaje = esRotativo
                        ? "¿Deseas crear un horario específico para este colaborador?"
                        : "¿Deseas crear un horario genérico para este colaborador?";

                    var decision = new MensajeWindow(mensaje, true, "Crear", "Cancelar");
                    if (decision.ShowDialog() == true && decision.Resultado)
                    {
                        usarHorarioEspecifico = esRotativo;
                    }
                    else
                    {
                        Logger.Agregar($"🚫 [{SesionSistema.NombreUsuario}] Canceló la creación de horario para empleado ID {idEmpleado}");
                        return;
                    }
                }

                if (usarHorarioEspecifico)
                {
                    var ventana = new AsignarHorarioWindow();
                    if (ventana.ShowDialog() == true)
                    {
                        var asignacion = new AsignacionHorario
                        {
                            IdEmpleado = idEmpleado,
                            FechaInicio = DateOnly.FromDateTime(DateTime.Today),
                            FechaFin = DateOnly.FromDateTime(new DateTime(DateTime.Today.Year, 12, 31)),
                            FechaCreacion = DateTime.Now,
                            CreadoPor = SesionSistema.IdUsuarioActual,
                            Estado = true,
                            TipoHorario = 2
                        };

                        context.AsignacionHorarios.Add(asignacion);
                        context.SaveChanges();

                        foreach (var dia in ventana.HorariosAsignados)
                        {
                            context.DetalleHorarios.Add(new DetalleHorario
                            {
                                IdAsignacion = asignacion.Id,
                                DiaSemana = dia.Key,
                                HoraInicio = TimeOnly.FromTimeSpan(dia.Value.Inicio),
                                HoraFin = TimeOnly.FromTimeSpan(dia.Value.Fin)
                            });
                        }

                        context.SaveChanges();
                        Logger.Agregar($"📅 [{SesionSistema.NombreUsuario}] Horario específico asignado para empleado ID {idEmpleado}");
                    }
                    else
                    {
                        Logger.Agregar($"⛔ [{SesionSistema.NombreUsuario}] Canceló ventana de horario específico");
                        return;
                    }
                }
                else
                {
                    var asignacion = new AsignacionHorario
                    {
                        IdEmpleado = idEmpleado,
                        FechaInicio = DateOnly.FromDateTime(DateTime.Today),
                        FechaFin = DateOnly.FromDateTime(new DateTime(DateTime.Today.Year, 12, 31)),
                        FechaCreacion = DateTime.Now,
                        CreadoPor = SesionSistema.IdUsuarioActual,
                        Estado = true,
                        TipoHorario = 1
                    };

                    context.AsignacionHorarios.Add(asignacion);
                    context.SaveChanges();

                    for (int dia = 1; dia <= 7; dia++)
                    {
                        context.DetalleHorarios.Add(new DetalleHorario
                        {
                            IdAsignacion = asignacion.Id,
                            DiaSemana = dia,
                            HoraInicio = TimeOnly.Parse("07:00:00"),
                            HoraFin = (dia == 5 || dia == 6) ? TimeOnly.Parse("16:30:00") : TimeOnly.Parse("17:30:00")
                        });
                    }

                    context.SaveChanges();
                    Logger.Agregar($"🕒 [{SesionSistema.NombreUsuario}] Horario genérico asignado para empleado ID {idEmpleado}");
                }

                string mensajeFinal = esModificacion ? "Empleado actualizado correctamente." : "Empleado registrado correctamente.";
                new MensajeWindow($"✅ {mensajeFinal}", false, "Aceptar", "").ShowDialog();

                if (!esModificacion)
                {
                    var confirmacion = new MensajeWindow("¿Deseas agregar otro empleado?", true, "Sí", "No");
                    if (confirmacion.ShowDialog() == true)
                    {
                        LimpiarFormulario();
                    }
                    else
                    {
                        if (Application.Current.MainWindow.FindName("MainContent") is ContentControl contenedor)
                            contenedor.Content = null;
                    }
                }

                esModificacion = false;
                idEmpleadoActual = 0;
                LimpiarFormulario();
            }
            catch (Exception ex)
            {
                var inner = ex.InnerException?.Message ?? "Sin detalle interno.";
                Logger.Agregar($"❌ [{SesionSistema.NombreUsuario}] Error inesperado: {ex.Message} | Interno: {inner}");
                new MensajeWindow($"❌ Ocurrió un error:\n{ex.Message}\nDetalles: {inner}", false, "Cerrar", "").ShowDialog();
            }
        }

        private void FinalizarGuardado(bool fueModificacion)
        {
            string mensajeFinal = fueModificacion ? "Empleado actualizado correctamente." : "Empleado registrado correctamente.";
            new MensajeWindow($"✅ {mensajeFinal}", false, "Aceptar", "").ShowDialog();

            if (!fueModificacion)
            {
                var confirmacion = new MensajeWindow("¿Deseas agregar otro empleado?", true, "Sí", "No");
                if (confirmacion.ShowDialog() == true)
                {
                    LimpiarFormulario();
                }
                else
                {
                    if (Application.Current.MainWindow.FindName("MainContent") is ContentControl contenedor)
                        contenedor.Content = null;
                }
            }

            esModificacion = false;
            idEmpleadoActual = 0;
            LimpiarFormulario();
        }

        private void BtnCapturarHuella_Click(object sender, RoutedEventArgs e)
        {
            Logger.Agregar("📸 Intentando iniciar captura de huella");
            try
            {
                new CapturaHuellaService().DetenerCaptura();
            }
            catch (Exception ex)
            {
                Logger.Agregar("⚠ No se pudo detener correctamente una captura previa: " + ex.Message);
            }

            var ventanaCaptura = new CapturarHuellaWindow();
            if (ventanaCaptura.ShowDialog() == true)
            {
                var template = ventanaCaptura.ResultadoTemplate;
                var imagenHuella = ventanaCaptura.UltimaHuellaCapturada;

                if (template != null && imagenHuella != null)
                {
                    _huellaCapturada = template;
                    imgHuella.Source = imagenHuella;
                    imgHuella.Visibility = Visibility.Visible;
                    imgHuellaBorder.Visibility = Visibility.Visible;
                    Logger.Agregar("✅ Huella capturada correctamente");
                    new MensajeWindow("✅ Huella capturada correctamente.", false, "Aceptar", "").ShowDialog();
                }
            }
            else
            {
                Logger.Agregar("❌ Captura de huella cancelada por el usuario");
                new MensajeWindow("❌ La captura fue cancelada.", false, "Cerrar", "").ShowDialog();
            }
        }

        private void LimpiarFormulario()
        {
            txtNombres.Text = "";
            txtApellidos.Text = "";
            txtCedula.Text = "";
            cbEmpresa.SelectedIndex = -1;
            cbSede.ItemsSource = null;
            cbArea.ItemsSource = null;
            cbTipoEmpleado.SelectedIndex = -1;
            _huellaCapturada = null;
            iconCedulaCheck.Visibility = Visibility.Collapsed;
            Logger.Agregar("🧹 Formulario de empleado limpiado");
        }

        private void BtnVolver_Click(object sender, RoutedEventArgs e)
        {
            Logger.Agregar("↩️ Usuario volvió a la pantalla principal desde RegistroEmpleado");
            if (Application.Current.MainWindow is MainWindow ventanaPrincipal &&
                ventanaPrincipal.FindName("MainContent") is ContentControl contenedor)
            {
                contenedor.Content = null;
                ventanaPrincipal.MostrarGifBienvenida();
            }
        }

        private BitmapImage ConvertirBitmapAImageSource(Bitmap bitmap)
        {
            using MemoryStream memory = new();
            bitmap.Save(memory, System.Drawing.Imaging.ImageFormat.Png);
            memory.Position = 0;
            BitmapImage bitmapImage = new();
            bitmapImage.BeginInit();
            bitmapImage.CacheOption = BitmapCacheOption.OnLoad;
            bitmapImage.StreamSource = memory;
            bitmapImage.EndInit();
            return bitmapImage;
        }
        // 👉 Permite solo letras
        private void SoloTexto_PreviewTextInput(object sender, System.Windows.Input.TextCompositionEventArgs e)
        {
            e.Handled = !e.Text.All(char.IsLetter);
        }

        // 👉 Convierte el texto a mayúsculas automáticamente
        private void ConvertirAMayusculas_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (sender is TextBox textBox)
            {
                int cursorPos = textBox.SelectionStart;
                string textoOriginal = textBox.Text;
                string textoMayuscula = textoOriginal.ToUpper();

                if (textoOriginal != textoMayuscula)
                {
                    textBox.Text = textoMayuscula;
                    textBox.SelectionStart = cursorPos;
                }
            }
        }
    }
}

