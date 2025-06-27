namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class Horario
{
    public int IdHorario { get; set; }

    public TimeOnly HorarioApertura { get; set; }

    public TimeOnly HorarioCierre { get; set; }

    public bool Estado { get; set; }
}
