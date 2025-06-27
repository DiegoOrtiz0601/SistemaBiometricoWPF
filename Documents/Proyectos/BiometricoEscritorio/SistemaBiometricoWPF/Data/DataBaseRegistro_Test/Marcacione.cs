namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class Marcacione
{
    public int Id { get; set; }

    public int IdEmpleado { get; set; }

    public DateTime FechaHora { get; set; }

    public int IdEmpresa { get; set; }

    public int IdSede { get; set; }

    public int IdTipoMarcacion { get; set; }

    /// <summary>
    /// Representa el horario asignado al empleado en el momento de la marcación
    /// </summary>
    public int IdAsignacion { get; set; }

    public virtual TiposMarcacion IdTipoMarcacionNavigation { get; set; } = null!;
}
