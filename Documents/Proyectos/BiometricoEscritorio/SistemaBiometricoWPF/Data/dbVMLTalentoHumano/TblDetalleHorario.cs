namespace BiomentricoHolding.Data.dbVMLTalentoHumano;

public partial class TblDetalleHorario
{
    public int IdDetalleHorario { get; set; }

    public int IdAsignacion { get; set; }

    public int DiaSemana { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }
}
