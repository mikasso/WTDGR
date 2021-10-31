using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Core
{
    public interface IRoomUsersManager
    {
        bool SetAdmin(string username);
        bool RemoveAdmin(string username);
        bool Add(User user);
        User Get(string id);
        bool Delete(string id);
        IList<User> GetAll();
        bool Exists(User user);
        bool Exists(string userName);
        User CreateOwner(string ownerId);
    }
    public class RoomUsersManager : IRoomUsersManager
    {
        private Dictionary<string, User> _users = new Dictionary<string, User>();
        private string _roomId;

        public User Owner { get; private set; }

        public RoomUsersManager(string id)
        {
            _roomId = id;
        }

        public User CreateOwner(string ownerId)
        {
            if (Owner != default)
                throw new Exception("Owner already exists!");
            var owner = new User()
            {
                Id = ownerId,
                Role = UserRoles.Owner,
                RoomId = _roomId,
            };
            Owner = owner;
            return owner;
        }
        public bool SetAdmin(string username)
        {
            if (!Exists(username))
                return false;
            var admin = _users[username];
            admin.Role = UserRoles.Admin;
            return true;
        }
        public bool RemoveAdmin(string username)
        {
            if (!Exists(username))
                return false;
            var user = _users[username];
            user.Role = UserRoles.User;
            return true;
        }
        public bool Add(User user)
        {
            user.Role = UserRoles.User;
            return _users.TryAdd(user.Id, user);
        }

        public bool Exists(User user)
        {
            return _users.ContainsKey(user.Id);
        }

        public bool Exists(string userName)
        {
            return _users.ContainsKey(userName);
        }

        public User Get(string id)
        {
            return _users[id];
        }

        public bool Delete(string id)
        {
            return _users.Remove(id);
        }

        public IList<User> GetAll()
        {
            return _users.Values.ToList();
        }
    }
}
