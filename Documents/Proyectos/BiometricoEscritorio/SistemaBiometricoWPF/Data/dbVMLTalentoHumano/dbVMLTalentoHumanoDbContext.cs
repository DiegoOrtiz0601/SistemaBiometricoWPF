using Microsoft.EntityFrameworkCore;

namespace BiomentricoHolding.Data.dbVMLTalentoHumano;

public partial class dbVMLTalentoHumanoDbContext : DbContext
{
    public dbVMLTalentoHumanoDbContext()
    {
    }

    public dbVMLTalentoHumanoDbContext(DbContextOptions<dbVMLTalentoHumanoDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TblArea> TblAreas { get; set; }

    public virtual DbSet<TblAsignacionHorario> TblAsignacionHorarios { get; set; }

    public virtual DbSet<TblCiudade> TblCiudades { get; set; }

    public virtual DbSet<TblDetalleHorario> TblDetalleHorarios { get; set; }

    public virtual DbSet<TblEmpresa> TblEmpresas { get; set; }

    public virtual DbSet<TblMarcacione> TblMarcaciones { get; set; }

    public virtual DbSet<TblSede> TblSedes { get; set; }

    public virtual DbSet<TblTipoEmpleado> TblTipoEmpleados { get; set; }

    public virtual DbSet<TblTipoHorario> TblTipoHorarios { get; set; }

    public virtual DbSet<TblTiposMarcacion> TblTiposMarcacions { get; set; }

    public virtual DbSet<TblUsuario> TblUsuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=190.71.223.36;Database=dbVMLTalentoHumano;User Id=DiegoOrtiz;Password=1234567890;TrustServerCertificate=True;Encrypt=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TblArea>(entity =>
        {
            entity.HasKey(e => e.IdArea);

            entity.Property(e => e.IdArea).ValueGeneratedNever();
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<TblAsignacionHorario>(entity =>
        {
            entity.HasKey(e => e.IdAsignacion);

            entity.Property(e => e.IdAsignacion).ValueGeneratedNever();
            entity.Property(e => e.FechaCreacion).HasColumnType("datetime");
        });

        modelBuilder.Entity<TblCiudade>(entity =>
        {
            entity.HasKey(e => e.IdCiudad).HasName("PK_TblCiudad");

            entity.Property(e => e.IdCiudad).ValueGeneratedNever();
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<TblDetalleHorario>(entity =>
        {
            entity.HasKey(e => e.IdDetalleHorario);

            entity.Property(e => e.IdDetalleHorario).ValueGeneratedNever();
        });

        modelBuilder.Entity<TblEmpresa>(entity =>
        {
            entity.HasKey(e => e.IdEmpresa);

            entity.Property(e => e.IdEmpresa).ValueGeneratedNever();
            entity.Property(e => e.Direccion).HasMaxLength(50);
            entity.Property(e => e.Nombre).HasMaxLength(50);
            entity.Property(e => e.Telefono).HasMaxLength(50);
        });

        modelBuilder.Entity<TblMarcacione>(entity =>
        {
            entity.HasKey(e => e.IdMarcacion);

            entity.Property(e => e.IdMarcacion).ValueGeneratedNever();
            entity.Property(e => e.FechaHora).HasColumnType("datetime");
        });

        modelBuilder.Entity<TblSede>(entity =>
        {
            entity.HasKey(e => e.IdSede).HasName("PK_TblSede");

            entity.Property(e => e.IdSede).ValueGeneratedNever();
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<TblTipoEmpleado>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<TblTipoHorario>(entity =>
        {
            entity.HasKey(e => e.IdHorario);

            entity.Property(e => e.IdHorario).ValueGeneratedNever();
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<TblTiposMarcacion>(entity =>
        {
            entity.HasKey(e => e.IdTipoMarcacion);

            entity.ToTable("TblTiposMarcacion");

            entity.Property(e => e.IdTipoMarcacion).ValueGeneratedNever();
            entity.Property(e => e.Nombre).HasMaxLength(10);
        });

        modelBuilder.Entity<TblUsuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario);

            entity.Property(e => e.IdUsuario).ValueGeneratedNever();
            entity.Property(e => e.Contraseña).HasMaxLength(50);
            entity.Property(e => e.Correo).HasMaxLength(50);
            entity.Property(e => e.Documento).HasMaxLength(50);
            entity.Property(e => e.FechaCreacion).HasColumnType("datetime");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
