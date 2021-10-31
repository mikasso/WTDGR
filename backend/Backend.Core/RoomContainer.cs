using System;
using System.Collections.Generic;
using System.Linq;
namespace Backend.Core
{
    public interface IRoomsContainer{
        public IRoomManager CreateRoom();
        public bool DeleteRoom(string Id);
        public IRoomManager GetRoom(string roomId);
        public int DeleteExpired(TimeSpan timeSpan);
    }
    public class RoomsContainer: IRoomsContainer
    {

        private readonly Dictionary<string, IRoomManager> _rooms = new();
        private IRoomManagerFactory _roomManagerFactory;
        private ITimeProvider _timeProvider;
        public RoomsContainer(IRoomManagerFactory roomManagerFactory, ITimeProvider timeProvider)
        {
            _roomManagerFactory = roomManagerFactory;
            _timeProvider = timeProvider;
        }
        public  IRoomManager CreateRoom()
        {
            var room = _roomManagerFactory.CreateRoomManager();
            _rooms.Add(room.RoomId, room);
            return room;
        }

        public int DeleteExpired(TimeSpan timeSpan)
        {
            var now = _timeProvider.Now();
            var deleted = _rooms
                .Where(kvp => kvp.Value.LastEditTimeStamp + timeSpan < now)
                .Select(kvp => DeleteRoom(kvp.Key))
                .Sum(x => x ? 1 : 0);
            return deleted;
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
