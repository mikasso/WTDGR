using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using System;

namespace Backend.Service
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Log.Logger = ConfigureLogger().CreateLogger();
            var app = CreateHostBuilder(args).Build();
            Log.Information($"Service is starting");
            app.Run();
            Log.Information("Service has turned down.");
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .ConfigureLogging(logging =>
            {
                logging.ClearProviders();
                var filterLogLevel = IsProduction() ? LogLevel.Error : LogLevel.Information;
                logging.SetMinimumLevel(filterLogLevel);
                logging.AddConsole();
            })
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            })
            .ConfigureServices(services =>
            {
                services.AddHostedService<RoomsCleaner>();
            });
        
        private static LoggerConfiguration ConfigureLogger()
        {
            var loggerConfiguration = new LoggerConfiguration()
            .WriteTo.Console();

            if (true)
                loggerConfiguration.MinimumLevel.Information();
            else
                loggerConfiguration.MinimumLevel.Debug();
            return loggerConfiguration;
        }
        private static bool IsProduction() => Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production";

    }
}
