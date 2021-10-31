using Backend.Models;
using Backend.Models.RoomItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.Core
{
    public interface IRoomManagerFactory
    {
        IRoomManager CreateRoomManager();
    }
    public class RoomManagerFactory : IRoomManagerFactory
    {
        private  readonly ITimeProvider _timeProvider;

        public RoomManagerFactory(ITimeProvider timeProvider)
        {
            _timeProvider = timeProvider;
        }
        public IRoomManager CreateRoomManager()
        {
            string id = Regex.Replace(Convert.ToBase64String(Guid.NewGuid().ToByteArray()), "[/+=]", "");
            RoomUsersManager usersManager = new(id);
            EdgeManager edgeManager = new();
            VerticesManager verticesManager = new();
            LayersManager layersManager = new();
            LineManager lineManager = new();
            layersManager.Initialize(verticesManager);
            edgeManager.Initialize(verticesManager);
            verticesManager.Initialize(edgeManager);
            return new RoomManager(id, _timeProvider, usersManager, verticesManager, edgeManager, lineManager, layersManager);
        }
    }
}
