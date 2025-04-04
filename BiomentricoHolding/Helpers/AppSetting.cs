using Microsoft.Extensions.Configuration;
using System;

namespace BiomentricoHolding.Helpers
{
    public static class AppSettings
    {
        private static IConfigurationRoot configuration;

        static AppSettings()
        {
            configuration = new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory) // ✅ Corrección para WPF en .NET 8
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();
        }

        public static string GetConnectionString(string name)
        {
            return configuration.GetConnectionString(name);
        }
    }
}
