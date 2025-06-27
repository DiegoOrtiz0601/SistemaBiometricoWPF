namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class DiasDeLaSemana
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<EmpleadosHorario> EmpleadosHorarios { get; set; } = new List<EmpleadosHorario>();
}
