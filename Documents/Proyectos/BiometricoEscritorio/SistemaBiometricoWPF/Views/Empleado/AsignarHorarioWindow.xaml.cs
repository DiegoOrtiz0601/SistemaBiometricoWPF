using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;

namespace BiomentricoHolding.Views.Empleado
{
    public partial class AsignarHorarioWindow : Window
    {
        private int _idEmpleado;

        public Dictionary<int, (TimeSpan Inicio, TimeSpan Fin)> HorariosAsignados { get; private set; } = new();

        public AsignarHorarioWindow()
        {
            InitializeComponent();
            GenerarControlesPorDia();
        }

        // 🔄 Constructor adicional con ID de empleado
        public AsignarHorarioWindow(int idEmpleado) : this()
        {
            _idEmpleado = idEmpleado;
        }

        private void GenerarControlesPorDia()
        {
            string[] dias = { "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo" };

            for (int i = 0; i < dias.Length; i++)
            {
                var row = new StackPanel
                {
                    Orientation = Orientation.Horizontal,
                    Margin = new Thickness(0, 5, 0, 5),
                    HorizontalAlignment = HorizontalAlignment.Center
                };

                row.Children.Add(new TextBlock
                {
                    Text = dias[i],
                    Width = 100,
                    VerticalAlignment = VerticalAlignment.Center,
                    FontWeight = FontWeights.SemiBold
                });

                row.Children.Add(CrearComboBox($"InicioHora_{i}", 0, 23));
                row.Children.Add(CrearComboBox($"InicioMin_{i}", 0, 59));
                row.Children.Add(new TextBlock { Text = " a ", Margin = new Thickness(10, 0, 10, 0), VerticalAlignment = VerticalAlignment.Center });
                row.Children.Add(CrearComboBox($"FinHora_{i}", 0, 23));
                row.Children.Add(CrearComboBox($"FinMin_{i}", 0, 59));

                panelDias.Children.Add(row);
            }
        }

        private ComboBox CrearComboBox(string name, int min, int max)
        {
            var combo = new ComboBox
            {
                Name = name,
                Width = 50,
                Margin = new Thickness(5, 0, 5, 0)
            };

            for (int i = min; i <= max; i++)
                combo.Items.Add(i.ToString("D2"));

            combo.SelectedIndex = 0;
            return combo;
        }

        private void BtnGuardar_Click(object sender, RoutedEventArgs e)
        {
            HorariosAsignados.Clear();

            for (int i = 0; i < 7; i++)
            {
                var stack = (StackPanel)panelDias.Children[i];

                var inicioHora = int.Parse(((ComboBox)stack.Children[1]).SelectedItem.ToString());
                var inicioMin = int.Parse(((ComboBox)stack.Children[2]).SelectedItem.ToString());
                var finHora = int.Parse(((ComboBox)stack.Children[4]).SelectedItem.ToString());
                var finMin = int.Parse(((ComboBox)stack.Children[5]).SelectedItem.ToString());

                var inicio = new TimeSpan(inicioHora, inicioMin, 0);
                var fin = new TimeSpan(finHora, finMin, 0);

                HorariosAsignados.Add(i + 1, (inicio, fin));
            }

            this.DialogResult = true;
            this.Close();
        }

        private void BtnCancelar_Click(object sender, RoutedEventArgs e)
        {
            this.DialogResult = false;
            this.Close();
        }
    }
}
