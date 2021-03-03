using Backend.DTO;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Helpers
{
    public class RoomController
    {
        private Dictionary<String, User> Users;
        private Dictionary<String, Vertex> Vertexes;
        public String Id { get; init; }
        
        public bool AddUser(User user)
        {
            if (Users.ContainsKey(user.Id))
                return false;
            Users.Add(user.Id, user);
            return true;
        }

        public bool KickUser(User user)
        {
            if (Users.ContainsKey(user.Id))
                return false;
            Users.Remove(user.Id);
            return true;
        }

        public bool AddVertex(Vertex vertex)
        {
            return false;
        }

        public bool DeleteVertex(Vertex vertex)
        {
            return false;
        }

        public bool UpdateVertex(Vertex vertex)
        {
            return false;
        }

    }
}
