using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Helpers
{
    public class RoomsManager
    {
        private Dictionary<string, RoomController> rooms;

        public bool Create(string Id)
        {
            if (rooms.ContainsKey(Id))
                return false;
            rooms.Remove(Id);
            return true;
        }

        public bool Delete(string Id)
        {
            if (rooms.ContainsKey(Id))
                return false;
            rooms.Remove(Id);
            return true;
        }
    }
}
