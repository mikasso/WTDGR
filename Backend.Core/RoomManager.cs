using Backend.Models;
using Serilog;
using System;

namespace Backend.Helpers
{
    public class RoomManager
    {
        public string Id { get; init; }

        public RoomManager(string id)
        {
            Log.Information($"Starting new room. Id: {id}");
            Id = id;
        }
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
