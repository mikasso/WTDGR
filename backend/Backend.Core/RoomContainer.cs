using System;
using System.Collections.Generic;

namespace Backend.Core
{
    public static class RoomsContainer {

        private static readonly Dictionary<string, RoomManager> _rooms = new();
        public static RoomManager CreateRoom()
        {
            var room = new RoomManager("1"); //ObjectId.GenerateNewId().ToString() };
            _rooms.Add(room.RoomId, room);
            return room;
        }

        public static bool DeleteRoom(string Id)
        {
            if (!_rooms.ContainsKey(Id))
                return false;
            _rooms.Remove(Id);
            return true;
        }

        public static RoomManager GetRoom(string roomId)
        {
            if (!_rooms.ContainsKey(roomId))
                throw new Exception("Room doesnt exists");
            return _rooms[roomId];
        }
    }
}
