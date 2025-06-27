namespace BiomentricoHolding.Data.dbVMLTalentoHumano;

public partial class TblSede
{
    public int IdSede { get; set; }

    public string Nombre { get; set; } = null!;

    public int IdEmpresa { get; set; }

    public int IdCiudad { get; set; }

    public bool Estado { get; set; }

    public int IdUsuario { get; set; }
}
