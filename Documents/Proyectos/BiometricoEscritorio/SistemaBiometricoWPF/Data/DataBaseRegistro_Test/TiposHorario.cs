namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class TiposHorario
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Estado { get; set; }

    public virtual ICollection<AsignacionHorario> AsignacionHorarios { get; set; } = new List<AsignacionHorario>();
}
