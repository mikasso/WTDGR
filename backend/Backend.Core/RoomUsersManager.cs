using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Core
{
    public interface IRoomUsersManager
    {
        bool SetEditor(string requester, string username);
        bool SetViewer(string requester, string username);
        bool Add(User user);
        User Get(string id);
        bool Delete(string id);
        IList<User> GetAll();
        bool Exists(User user);
        bool Exists(string userName);
        User CreateOwner(string ownerId);
        bool CanEdit(string id);
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
                Role = UserRole.Owner,
                RoomId = _roomId,
            };
            Owner = owner;
            return owner;
        }
        public bool SetEditor(string requester, string username)
        {
            if (!isUpdatePossible(requester, username))
                return false;
            var admin = _users[username];
            admin.Role = UserRole.Editor;
            return true;
        }
        public bool SetViewer(string requester,string username)
        {
            if (!isUpdatePossible(requester, username))
                return false;
            var user = _users[username];
            user.Role = UserRole.Viewer;
            return true;
        }

        private bool isUpdatePossible(string requester, string username)
        {
            return requester == Owner.Id && username != Owner.Id && Exists(username);
        }

        public bool CanEdit(string userId)
        {
            var user = Get(userId);
            return user.Role != UserRole.Viewer;
        }

        public bool Add(User user)
        {
            if (user.Id != Owner.Id)
                user.Role = UserRole.Viewer;
            else
                user.Role = UserRole.Owner;
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
