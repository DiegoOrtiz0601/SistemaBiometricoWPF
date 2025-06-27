using BiomentricoHolding.Data.DataBaseRegistro_Test;
using BiomentricoHolding.Data.dbVMLTalentoHumano;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BiomentricoHolding
{
    public static class AppSettings
    {
        private static IConfigurationRoot configuration;

        static AppSettings()
        {
            configuration = new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();
        }

        public static string GetConnectionString(string name)
        {
            return configuration.GetConnectionString(name);
        }

        public static DataBaseRegistro_TestDbContext GetContextUno()
        {
            var connection = GetConnectionString("MainDbConnection");
            var options = new DbContextOptionsBuilder<DataBaseRegistro_TestDbContext>()
                .UseSqlServer(connection)
                .Options;
            return new DataBaseRegistro_TestDbContext(options);
        }

        public static dbVMLTalentoHumanoDbContext GetContextDos()
        {
            var connection = GetConnectionString("SecondaryDbConnection");
            var options = new DbContextOptionsBuilder<dbVMLTalentoHumanoDbContext>()
                .UseSqlServer(connection)
                .Options;
            return new dbVMLTalentoHumanoDbContext(options);
        }
    }
}