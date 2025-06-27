namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class Sede
{
    public int IdSede { get; set; }

    public string Nombre { get; set; } = null!;

    public int IdEmpresa { get; set; }

    public int IdCiudad { get; set; }

    public bool Estado { get; set; }

    public int IdUsuario { get; set; }

    public virtual ICollection<Area> Areas { get; set; } = new List<Area>();

    public virtual ICollection<Empleado> Empleados { get; set; } = new List<Empleado>();

    public virtual Ciudad IdCiudadNavigation { get; set; } = null!;

    public virtual Empresa IdEmpresaNavigation { get; set; } = null!;

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
