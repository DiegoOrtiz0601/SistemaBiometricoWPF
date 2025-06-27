namespace BiomentricoHolding.Data.dbVMLTalentoHumano;

public partial class TblUsuario
{
    public int IdUsuario { get; set; }

    public string Documento { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string Contraseña { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public string Correo { get; set; } = null!;

    public bool Estado { get; set; }

    public bool? App { get; set; }
}
