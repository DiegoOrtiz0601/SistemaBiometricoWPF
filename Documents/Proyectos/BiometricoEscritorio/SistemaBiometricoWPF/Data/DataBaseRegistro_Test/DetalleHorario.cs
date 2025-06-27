namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class DetalleHorario
{
    public int Id { get; set; }

    public int IdAsignacion { get; set; }

    public int DiaSemana { get; set; }

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }

    public virtual AsignacionHorario IdAsignacionNavigation { get; set; } = null!;
}
