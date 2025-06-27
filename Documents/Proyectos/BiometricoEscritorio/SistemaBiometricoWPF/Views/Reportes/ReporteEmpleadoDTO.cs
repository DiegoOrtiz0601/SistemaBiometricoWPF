public class ReporteEmpleadoDTO
{
    public string Documento { get; set; }
    public string NombreCompleto { get; set; }
    public string Empresa { get; set; }
    public string Sede { get; set; }
    public string Area { get; set; }
    public string TipoMarcacion { get; set; }
    public string DiaSemana { get; set; }
    public string FechaHora { get; set; }
    public string HoraEsperada { get; set; }
    public string Retardo { get; set; }
    public string EstadoIcono { get; set; } // 🟢 o 🔴 para FontAwesome
}
