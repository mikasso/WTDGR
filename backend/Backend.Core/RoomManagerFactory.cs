using Backend.Models;
using Backend.Models.RoomItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Core
{
    public interface IRoomManagerFactory
    {
        IRoomManager CreateRoomManager();
    }
    public class RoomManagerFactory : IRoomManagerFactory
    {
        public IRoomManager CreateRoomManager()
        {
            //string id = Guid.NewGuid().ToString();
            string id = "1";
            RoomUsersManager usersManager = new(id);
            EdgeManager edgeManager = new();
            VerticesManager verticesManager = new();
            LayersManager layersManager = new();
            LineManager lineManager = new();
            layersManager.Initialize(verticesManager);
            edgeManager.Initialize(verticesManager);
            verticesManager.Initialize(edgeManager);
            return new RoomManager(id, usersManager, verticesManager, edgeManager, lineManager, layersManager);
        }
    }
}
