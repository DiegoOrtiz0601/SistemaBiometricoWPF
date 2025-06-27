# Sistema Biométrico WPF - Documentación Técnica

## Información General
- **Nombre del Proyecto**: BiomentricoHolding
- **Versión Actual**: 1.0.8
- **Tipo de Aplicación**: Aplicación de Escritorio (WinExe)

## Tecnologías Principales
- **Framework**: .NET 8.0 Windows
- **Interfaz Gráfica**: WPF (Windows Presentation Foundation)
- **Arquitectura**: MVVM (Model-View-ViewModel)

## Características Técnicas

### 1. Hardware Biométrico
- Integración con DigitalPersona para lectura de huellas dactilares
- Utiliza las siguientes bibliotecas:
  - DPFPDevNET
  - DPFPEngNET
  - DPFPVerNET
  - DPFPShrNET

### 2. Base de Datos
- SQL Server
- Entity Framework Core 9.0.3
- Conexión a base de datos remota

### 3. Dependencias Principales
- Microsoft.Data.SqlClient 6.0.1
- Microsoft.EntityFrameworkCore.SqlServer 9.0.3
- Microsoft.EntityFrameworkCore.Tools 9.0.3
- WpfAnimatedGif 2.0.2
- System.Drawing.Common 9.0.3

## Estructura del Proyecto
```
SistemaBiometricoWPF/
├── Views/           # Vistas de la aplicación
├── ViewModels/      # Lógica de presentación
├── Models/          # Modelos de datos
├── Services/        # Servicios de la aplicación
├── Data/            # Acceso a datos y contexto
├── Utils/          # Utilidades y helpers
├── Assets/         # Recursos gráficos
│   └── huella-dactilar.ico
└── Libs/           # Bibliotecas externas
    └── DigitalPersona/  # DLLs del lector biométrico
```

## Características de Desarrollo
- Soporte para Nullable Reference Types
- Uso de ImplicitUsings
- Configuración basada en JSON (appsettings.json)
- Icono personalizado de la aplicación

## Seguridad y Configuración
- Conexión a base de datos con autenticación de usuario
- Certificados de servidor configurados (TrustServerCertificate=True)
- Encriptación habilitada en la conexión a base de datos

## Descripción General
Esta aplicación está diseñada para gestionar registros biométricos en un entorno empresarial, utilizando tecnologías modernas de Microsoft y hardware especializado para la captura de huellas dactilares. La arquitectura MVVM y la estructura del proyecto sugieren un diseño robusto y mantenible.

## Requisitos del Sistema
- Windows 10 o superior
- .NET 8.0 Runtime
- SQL Server (para la base de datos)
- Hardware biométrico compatible con DigitalPersona

## Contacto y Soporte
Para más información o soporte técnico, contacte al equipo de desarrollo.

---
*Última actualización de la documentación: Marzo 2024* 