using Backend.Core;
using Backend.Core.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Service
{
    public class RoomsCleaner : IHostedService, IDisposable
    {
        IRoomsContainer _roomsContainer;
        RoomsCleanerSettings _settings;
        public RoomsCleaner(IRoomsContainer roomsContainer, IConfiguration configuration)
        {
            _roomsContainer = roomsContainer;
            _settings = new RoomsCleanerSettings()
            {
                CleaningIntervalInSeconds = int.Parse(configuration[$"{nameof(RoomsCleanerSettings)}:{nameof(RoomsCleanerSettings.CleaningIntervalInSeconds)}"]),
                SecondsThreshold = int.Parse(configuration[$"{nameof(RoomsCleanerSettings)}:{nameof(RoomsCleanerSettings.SecondsThreshold)}"]),
            };
        }
        private Timer _timer;
        public Task StartAsync(CancellationToken cancellationToken)
        {
            Log.Information("Rooms cleaner is running.");
            var interval = TimeSpan.FromSeconds(_settings.CleaningIntervalInSeconds);
            _timer = new Timer(DoWork, null, interval, interval);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            Log.Information("Rooms cleaner is stopping.");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }

        private void DoWork(object state)
        {
            Log.Information("Rooms cleaner is looking for rooms to delete.");
            var deletedCoutned = _roomsContainer.DeleteExpired(TimeSpan.FromSeconds(_settings.SecondsThreshold));
            Log.Information($"Rooms cleaner has deleted {deletedCoutned} rooms.");
        }
    }
}
