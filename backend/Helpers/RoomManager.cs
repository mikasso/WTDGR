using Backend.DTO;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Helpers
{
    public class RoomManager
    {
        public string Id { get; init; }
        public User Owner { get; private set; }
        public readonly UsersManager Users = new();
        public readonly VerticesManager Vertices = new();
        public User CreateOwner(User owner)
        {
            if (Owner != default)
                throw new Exception("Owner already exists!");
            owner.Role = UserRoles.Owner;
            owner.RoomId = Id;
            Owner = owner;
            return owner;
        }
    }
}
