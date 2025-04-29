using System;

namespace BiomentricoHolding.Data.DataBaseRegistro_Test
{
    public class VersionSistema
    {
        public int Id { get; set; }
        public string NumeroVersion { get; set; }
        public DateTime FechaPublicacion { get; set; }
        public string Comentarios { get; set; }
    }
}
