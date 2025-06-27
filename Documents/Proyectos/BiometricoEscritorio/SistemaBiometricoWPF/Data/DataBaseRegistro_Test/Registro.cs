namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class Registro
{
    public int IdRegistro { get; set; }

    public int Cedula { get; set; }

    public DateOnly FechaRegistro { get; set; }

    public string HoraRegistro { get; set; } = null!;

    public string? HoraIngreso { get; set; }

    public int IdSede { get; set; }

    public int IdEmpresa { get; set; }

    public int? TipoRegistro { get; set; }

    public bool? LlegoTarde { get; set; }

    public virtual TiposMarcacion? TiposMarcacion { get; set; }
}
