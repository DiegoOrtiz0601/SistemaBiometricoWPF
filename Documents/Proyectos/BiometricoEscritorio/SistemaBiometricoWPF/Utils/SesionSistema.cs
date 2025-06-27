using BiomentricoHolding.Data.DataBaseRegistro_Test;

namespace BiomentricoHolding.Utils
{
    public static class SesionSistema
    {
        public static Usuario UsuarioActual { get; set; }

        public static int IdUsuarioActual => UsuarioActual?.IdUsuario ?? 0;
        public static string NombreUsuario => UsuarioActual?.NombreUsuario ?? "Desconocido";
    }
}