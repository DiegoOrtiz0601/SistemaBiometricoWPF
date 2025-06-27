namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string NombreUsuario { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string Contrasena { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public string Correo { get; set; } = null!;

    public bool Estado { get; set; }

    public bool? App { get; set; }

    public virtual ICollection<Sede> Sedes { get; set; } = new List<Sede>();
}
