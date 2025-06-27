namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class TiposMarcacion
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Estado { get; set; }

    public virtual Registro IdNavigation { get; set; } = null!;

    public virtual ICollection<Marcacione> Marcaciones { get; set; } = new List<Marcacione>();
}
