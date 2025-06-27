namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class TiposEmpleado
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Estado { get; set; }

    public virtual ICollection<Empleado> Empleados { get; set; } = new List<Empleado>();
}
