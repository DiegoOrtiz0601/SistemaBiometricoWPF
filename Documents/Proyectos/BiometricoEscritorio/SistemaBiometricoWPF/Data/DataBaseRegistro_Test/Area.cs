namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class Area
{
    public int IdArea { get; set; }

    public int? IdSede { get; set; }

    public string? Nombre { get; set; }

    public bool? Estado { get; set; }

    public virtual Sede? IdSedeNavigation { get; set; }
}
