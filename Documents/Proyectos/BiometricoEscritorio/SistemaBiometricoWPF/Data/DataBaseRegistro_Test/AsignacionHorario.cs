namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class AsignacionHorario
{
    public int Id { get; set; }

    public int IdEmpleado { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly? FechaFin { get; set; }

    public DateTime FechaCreacion { get; set; }

    public int CreadoPor { get; set; }

    public bool Estado { get; set; }

    public int TipoHorario { get; set; }

    public virtual ICollection<DetalleHorario> DetalleHorarios { get; set; } = new List<DetalleHorario>();

    public virtual Empleado IdEmpleadoNavigation { get; set; } = null!;

    public virtual TiposHorario TipoHorarioNavigation { get; set; } = null!;
}
