namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class EmpleadosHorario
{
    public int Id { get; set; }

    public int EmpleadoId { get; set; }

    public int? DiaSemana { get; set; }

    public TimeOnly Inicio { get; set; }

    public TimeOnly Fin { get; set; }

    public bool Estado { get; set; }

    public virtual DiasDeLaSemana? DiaSemanaNavigation { get; set; }
}
