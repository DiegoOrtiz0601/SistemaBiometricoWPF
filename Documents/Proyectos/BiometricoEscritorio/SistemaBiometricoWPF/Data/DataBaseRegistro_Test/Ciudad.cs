namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class Ciudad
{
    public int IdCiudad { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Estado { get; set; }

    public virtual ICollection<Sede> Sedes { get; set; } = new List<Sede>();
}
