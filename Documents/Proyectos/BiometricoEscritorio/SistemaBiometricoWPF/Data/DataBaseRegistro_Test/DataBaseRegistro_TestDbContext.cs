using Microsoft.EntityFrameworkCore;

namespace BiomentricoHolding.Data.DataBaseRegistro_Test;

public partial class DataBaseRegistro_TestDbContext : DbContext
{
    public DataBaseRegistro_TestDbContext()
    {
    }

    public DataBaseRegistro_TestDbContext(DbContextOptions<DataBaseRegistro_TestDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Area> Areas { get; set; }

    public virtual DbSet<AsignacionHorario> AsignacionHorarios { get; set; }

    public virtual DbSet<Ciudad> Ciudads { get; set; }

    public virtual DbSet<DetalleHorario> DetalleHorarios { get; set; }

    public virtual DbSet<DiasDeLaSemana> DiasDeLaSemanas { get; set; }

    public virtual DbSet<Empleado> Empleados { get; set; }

    public virtual DbSet<EmpleadosHorario> EmpleadosHorarios { get; set; }

    public virtual DbSet<Empresa> Empresas { get; set; }

    public virtual DbSet<Horario> Horarios { get; set; }

    public virtual DbSet<Marcacione> Marcaciones { get; set; }

    public virtual DbSet<Registro> Registros { get; set; }

    public virtual DbSet<Sede> Sedes { get; set; }

    public virtual DbSet<TiposEmpleado> TiposEmpleados { get; set; }

    public virtual DbSet<TiposHorario> TiposHorarios { get; set; }

    public virtual DbSet<TiposMarcacion> TiposMarcacions { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<VersionSistema> VersionSistema { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseSqlServer("Server=190.71.223.36;Database=DataBaseRegistros_Test;User Id=DesktopApp;Password=VmL2023**;TrustServerCertificate=True;Encrypt=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Area>(entity =>
        {
            entity.HasKey(e => e.IdArea).HasName("PK__Areas__2FC141AA8BDE40BC");

            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.IdSedeNavigation).WithMany(p => p.Areas)
                .HasForeignKey(d => d.IdSede)
                .HasConstraintName("FK_Areas_Sede");
        });

        modelBuilder.Entity<AsignacionHorario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Asignaci__A7235DFF01331F14");

            entity.Property(e => e.Estado)
            .IsRequired()              // 👈 Esto es lo que falta
            .HasDefaultValue(true);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.IdEmpleadoNavigation).WithMany(p => p.AsignacionHorarios)
                .HasForeignKey(d => d.IdEmpleado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AsignacionHorarios_Empleados");

            entity.HasOne(d => d.TipoHorarioNavigation).WithMany(p => p.AsignacionHorarios)
                .HasForeignKey(d => d.TipoHorario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Asignacio__TipoH__3B95D2F1");
        });

        modelBuilder.Entity<Ciudad>(entity =>
        {
            entity.HasKey(e => e.IdCiudad);

            entity.ToTable("Ciudad");

            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<DetalleHorario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Empleado__3213E83FA456AA1F");

            entity.HasOne(d => d.IdAsignacionNavigation).WithMany(p => p.DetalleHorarios)
                .HasForeignKey(d => d.IdAsignacion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DetalleHorarios_AsignacionHorarios");
        });

        modelBuilder.Entity<DiasDeLaSemana>(entity =>
        {
            entity.ToTable("DiasDeLaSemana");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre)
                .HasMaxLength(10)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.HasKey(e => e.IdEmpleado);

            entity.Property(e => e.Apellidos)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.FechaIngreso).HasColumnType("datetime");
            entity.Property(e => e.IdTipoEmpleado).HasDefaultValue(3);
            entity.Property(e => e.Nombres)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.IdEmpresaNavigation).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.IdEmpresa)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Empleados_Empresa");

            entity.HasOne(d => d.IdSedeNavigation).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.IdSede)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Empleados_Sede");

            entity.HasOne(d => d.IdTipoEmpleadoNavigation).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.IdTipoEmpleado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Empleados_tipos_empleado");
        });

        modelBuilder.Entity<EmpleadosHorario>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DiaSemana).HasColumnName("dia_semana");
            entity.Property(e => e.EmpleadoId).HasColumnName("empleado_id");
            entity.Property(e => e.Estado).HasColumnName("estado");
            entity.Property(e => e.Fin).HasColumnName("fin");
            entity.Property(e => e.Inicio).HasColumnName("inicio");

            entity.HasOne(d => d.DiaSemanaNavigation).WithMany(p => p.EmpleadosHorarios)
                .HasForeignKey(d => d.DiaSemana)
                .HasConstraintName("FK_EmpleadosHorarios_DiasDeLaSemana");
        });

        modelBuilder.Entity<Empresa>(entity =>
        {
            entity.HasKey(e => e.IdEmpresa);

            entity.ToTable("Empresa");

            entity.Property(e => e.Direccion)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Telefono)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Horario>(entity =>
        {
            entity.HasKey(e => e.IdHorario);

            entity.ToTable("Horario");

            entity.Property(e => e.HorarioApertura).HasPrecision(0);
            entity.Property(e => e.HorarioCierre).HasPrecision(0);
        });

        modelBuilder.Entity<Marcacione>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__MARCACIO__3214EC07B67FC883");

            entity.Property(e => e.FechaHora).HasColumnType("datetime");
            entity.Property(e => e.IdAsignacion).HasComment("Representa el horario asignado al empleado en el momento de la marcación");

            entity.HasOne(d => d.IdTipoMarcacionNavigation).WithMany(p => p.Marcaciones)
                .HasForeignKey(d => d.IdTipoMarcacion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Marcaciones_TiposMarcacion");
        });

        modelBuilder.Entity<Registro>(entity =>
        {
            entity.HasKey(e => e.IdRegistro);

            entity.ToTable("Registro");

            entity.Property(e => e.IdRegistro).HasColumnName("idRegistro");
            entity.Property(e => e.HoraIngreso)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("horaIngreso");
            entity.Property(e => e.HoraRegistro)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.IdEmpresa).HasColumnName("idEmpresa");
            entity.Property(e => e.LlegoTarde).HasColumnName("llego_tarde");
            entity.Property(e => e.TipoRegistro).HasColumnName("tipo_registro");
        });

        modelBuilder.Entity<Sede>(entity =>
        {
            entity.HasKey(e => e.IdSede);

            entity.ToTable("Sede");

            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.IdCiudadNavigation).WithMany(p => p.Sedes)
                .HasForeignKey(d => d.IdCiudad)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sede_Ciudad");

            entity.HasOne(d => d.IdEmpresaNavigation).WithMany(p => p.Sedes)
                .HasForeignKey(d => d.IdEmpresa)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sede_Empresa");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.Sedes)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sede_Usuario");
        });

        modelBuilder.Entity<TiposEmpleado>(entity =>
        {
            entity.ToTable("tipos_empleado");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Estado).HasColumnName("estado");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("nombre");
        });

        modelBuilder.Entity<TiposHorario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TiposHor__3214EC070B925311");

            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<TiposMarcacion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_tipos_registro");

            entity.ToTable("TiposMarcacion");

            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.IdNavigation).WithOne(p => p.TiposMarcacion)
                .HasForeignKey<TiposMarcacion>(d => d.Id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_tipos_registro_Registro");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario);

            entity.ToTable("Usuario");

            entity.Property(e => e.Contrasena)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Correo)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Estado).HasColumnName("estado");
            entity.Property(e => e.FechaCreacion).HasColumnType("datetime");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.NombreUsuario)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
