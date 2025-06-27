namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class Empleado
{
    public int IdEmpleado { get; set; }

    public string Nombres { get; set; } = null!;

    public string Apellidos { get; set; } = null!;

    public int Documento { get; set; }

    public int IdEmpresa { get; set; }

    public byte[]? Huella { get; set; }

    public bool Estado { get; set; }

    public DateTime FechaIngreso { get; set; }

    public int IdSede { get; set; }

    public int IdArea { get; set; }

    public int IdUsuario { get; set; }

    public int IdTipoEmpleado { get; set; }

    public virtual ICollection<AsignacionHorario> AsignacionHorarios { get; set; } = new List<AsignacionHorario>();

    public virtual Empresa IdEmpresaNavigation { get; set; } = null!;

    public virtual Sede IdSedeNavigation { get; set; } = null!;

    public virtual TiposEmpleado IdTipoEmpleadoNavigation { get; set; } = null!;
}
