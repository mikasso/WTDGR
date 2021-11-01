using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

namespace Backend.Service
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Log.Logger = new LoggerConfiguration()
            .WriteTo.Console()
            .WriteTo.File("C:\\WTDGR_logs.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();
            var app = CreateHostBuilder(args).Build();
            Log.Information("Service starting..");
            Log.Information("Waiting for connections");
            app.Run();
            Log.Information("Service has turned down.");
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
            .ConfigureLogging(logging =>
            {
                logging.ClearProviders();
                logging.AddFilter("Microsoft.AspNetCore.SignalR", LogLevel.Debug);
                logging.AddFilter("Microsoft.AspNetCore.Http.Connections", LogLevel.Debug);
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
        
    }
}
