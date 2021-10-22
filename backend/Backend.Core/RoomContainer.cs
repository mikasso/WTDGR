using System;
using System.Collections.Generic;

namespace Backend.Core
{
    public interface IRoomsContainer{
        public IRoomManager CreateRoom();
        public bool DeleteRoom(string Id);
        public IRoomManager GetRoom(string roomId);
    }
    public class RoomsContainer: IRoomsContainer
    {

        private readonly Dictionary<string, IRoomManager> _rooms = new();
        private IRoomManagerFactory _roomManagerFactory;

        public RoomsContainer(IRoomManagerFactory roomManagerFactory)
        {
            _roomManagerFactory = roomManagerFactory;
            CreateRoom(); //TODO remove it when many rooms when become possible
        }
        public  IRoomManager CreateRoom()
        {
            var room = _roomManagerFactory.CreateRoomManager();
            _rooms.Add(room.RoomId, room);
            return room;
        }

        public  bool DeleteRoom(string Id)
        {
            if (!_rooms.ContainsKey(Id))
                return false;
            _rooms.Remove(Id);
            return true;
        }

        public  IRoomManager GetRoom(string roomId)
        {
            if (!_rooms.ContainsKey(roomId))
                throw new Exception("Room doesnt exists");
            return _rooms[roomId];
        }
    }
}
