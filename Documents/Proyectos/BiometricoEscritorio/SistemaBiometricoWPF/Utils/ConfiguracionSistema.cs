using System.IO;
using System.Text.Json;

namespace BiomentricoHolding.Utils
{
    public static class ConfiguracionSistema
    {
        private static readonly string rutaArchivo = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json");

        public static int? IdEmpresaActual { get; private set; }
        public static string NombreEmpresaActual { get; private set; }
        public static int? IdSedeActual { get; private set; }
        public static string NombreSedeActual { get; private set; }

        public static bool EstaConfigurado => IdEmpresaActual.HasValue && IdSedeActual.HasValue;

        public static void EstablecerConfiguracion(int idEmpresa, string nombreEmpresa, int idSede, string nombreSede)
        {
            IdEmpresaActual = idEmpresa;
            NombreEmpresaActual = nombreEmpresa;
            IdSedeActual = idSede;
            NombreSedeActual = nombreSede;

            GuardarConfiguracion();
        }

        public static void CargarConfiguracion()
        {
            if (!File.Exists(rutaArchivo))
            {
                IdEmpresaActual = null;
                NombreEmpresaActual = null;
                IdSedeActual = null;
                NombreSedeActual = null;
                return;
            }

            try
            {
                var json = File.ReadAllText(rutaArchivo);
                var datos = JsonSerializer.Deserialize<ConfiguracionData>(json);

                IdEmpresaActual = datos?.IdEmpresa;
                NombreEmpresaActual = datos?.NombreEmpresa;
                IdSedeActual = datos?.IdSede;
                NombreSedeActual = datos?.NombreSede;
            }
            catch
            {
                IdEmpresaActual = null;
                NombreEmpresaActual = null;
                IdSedeActual = null;
                NombreSedeActual = null;
            }
        }

        private static void GuardarConfiguracion()
        {
            var datos = new ConfiguracionData
            {
                IdEmpresa = IdEmpresaActual,
                NombreEmpresa = NombreEmpresaActual,
                IdSede = IdSedeActual,
                NombreSede = NombreSedeActual
            };

            var json = JsonSerializer.Serialize(datos, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(rutaArchivo, json);
        }

        private class ConfiguracionData
        {
            public int? IdEmpresa { get; set; }
            public string NombreEmpresa { get; set; }

            public int? IdSede { get; set; }
            public string NombreSede { get; set; }
        }
    }
}
