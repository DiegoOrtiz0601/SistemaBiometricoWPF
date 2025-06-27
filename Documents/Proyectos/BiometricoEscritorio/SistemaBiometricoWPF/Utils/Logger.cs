using System.IO;
using System.Text;

namespace BiomentricoHolding.Utils
{
    public static class Logger
    {
        private static readonly StringBuilder _contenido = new();
        private static readonly string _logFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "log_sistema.txt");

        public static event Action? LogActualizado;

        static Logger()
        {
            // Cargar contenido desde archivo al iniciar
            if (File.Exists(_logFilePath))
            {
                var contenidoInicial = File.ReadAllText(_logFilePath);
                _contenido.Append(contenidoInicial);
            }
        }

        public static void Agregar(string mensaje)
        {
            string log = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {mensaje}";
            _contenido.AppendLine(log);

            // También guardar directamente en archivo
            try
            {
                File.AppendAllText(_logFilePath, log + Environment.NewLine);
            }
            catch (Exception ex)
            {
                // Silenciar errores de escritura
                System.Diagnostics.Debug.WriteLine("Error al escribir en el log: " + ex.Message);
            }

            LogActualizado?.Invoke(); // Notificar UI si corresponde
        }

        public static string ObtenerContenido() => _contenido.ToString();

        public static void GuardarEnArchivo(string ruta)
        {
            File.WriteAllText(ruta, _contenido.ToString());
        }

        public static void Limpiar()
        {
            _contenido.Clear();
            File.Delete(_logFilePath);
            LogActualizado?.Invoke();
        }
    }
}
