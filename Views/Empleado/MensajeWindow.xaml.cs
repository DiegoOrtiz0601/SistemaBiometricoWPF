using System;
using System.Windows;

namespace BiomentricoHolding.Views
{
    public partial class MensajeWindow : Window
    {
        public bool Resultado { get; private set; } = false;
        private bool fueAbiertaConShowDialog = false;

        public MensajeWindow(string mensaje, bool mostrarCancelar = false)
        {
            InitializeComponent();
            txtMensaje.Text = mensaje;
            btnCancelar.Visibility = mostrarCancelar ? Visibility.Visible : Visibility.Collapsed;
        }

        // Nuevo ShowDialog sobreescrito
        public new bool? ShowDialog()
        {
            fueAbiertaConShowDialog = true;
            return base.ShowDialog();
        }

        // Constructor con texto personalizado
        public MensajeWindow(string mensaje, bool mostrarCancelar, string textoAceptar, string textoCancelar)
            : this(mensaje, mostrarCancelar)
        {
            btnOK.Content = string.IsNullOrWhiteSpace(textoAceptar) ? "Aceptar" : textoAceptar;

            if (!mostrarCancelar || string.IsNullOrWhiteSpace(textoCancelar))
            {
                btnCancelar.Visibility = Visibility.Collapsed;
            }
            else
            {
                btnCancelar.Content = textoCancelar;
                btnCancelar.Visibility = Visibility.Visible;
            }
        }

        // Autocierre
        public MensajeWindow(string mensaje, int segundosAutocierre)
            : this(mensaje, false)
        {
            btnOK.Visibility = Visibility.Collapsed;
            btnCancelar.Visibility = Visibility.Collapsed;

            var timer = new System.Windows.Threading.DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(segundosAutocierre)
            };
            timer.Tick += (s, e) =>
            {
                timer.Stop();
                this.Close();
            };
            timer.Start();
        }

        // Carga tipo modal
        public MensajeWindow(string mensaje, bool mostrarCancelar, bool esCarga)
            : this(mensaje, mostrarCancelar)
        {
            if (esCarga)
            {
                btnOK.Visibility = Visibility.Collapsed;
                btnCancelar.Visibility = Visibility.Collapsed;
                this.Cursor = System.Windows.Input.Cursors.Wait;
            }
        }

        // Tipo visual
        public MensajeWindow(string mensaje, int segundosAutocierre, string tipo)
            : this(mensaje, false)
        {
            btnOK.Visibility = Visibility.Collapsed;
            btnCancelar.Visibility = Visibility.Collapsed;

            switch (tipo.ToLower())
            {
                case "advertencia":
                    icono.Text = "⚠";
                    icono.Foreground = System.Windows.Media.Brushes.DarkOrange;
                    break;
                case "error":
                    icono.Text = "❌";
                    icono.Foreground = System.Windows.Media.Brushes.Red;
                    break;
                default:
                    icono.Text = "🔔";
                    icono.Foreground = System.Windows.Media.Brushes.SteelBlue;
                    break;
            }

            var timer = new System.Windows.Threading.DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(segundosAutocierre)
            };
            timer.Tick += (s, e) =>
            {
                timer.Stop();
                this.Close();
            };
            timer.Start();
        }

        private void BtnOK_Click(object sender, RoutedEventArgs e)
        {
            Resultado = true;
            if (fueAbiertaConShowDialog)
                this.DialogResult = true;
            else
                this.Close();
        }

        private void BtnCancelar_Click(object sender, RoutedEventArgs e)
        {
            Resultado = false;
            if (fueAbiertaConShowDialog)
                this.DialogResult = false;
            else
                this.Close();
        }

        private void BtnCerrar_Click(object sender, RoutedEventArgs e)
        {
            Resultado = false;
            if (fueAbiertaConShowDialog)
                this.DialogResult = false;
            else
                this.Close();
        }

        protected override void OnClosing(System.ComponentModel.CancelEventArgs e)
        {
            base.OnClosing(e);
            if (fueAbiertaConShowDialog && !this.DialogResult.HasValue)
                this.DialogResult = false;
        }
    }
}
