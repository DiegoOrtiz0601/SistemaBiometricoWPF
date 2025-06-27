namespace BiomentricoHolding.Data.dbVMLTalentoHumano;

public partial class TblAsignacionHorario
{
    public int IdAsignacion { get; set; }

    public int IdEmpleado { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly? FechaFin { get; set; }

    public DateTime FechaCreacion { get; set; }

    public int CreadoPor { get; set; }

    public bool Estado { get; set; }

    public int TipoHorario { get; set; }
}
