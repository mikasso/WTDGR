using Backend.Models;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Core
{
    public interface IUserManager
    {
        public bool SetAdmin(string username);
        public bool RemoveAdmin(string username);
        public bool Add(User user);
        public User Get(string id);
        public bool Delete(string id);
        public IList<User> GetAll();
        public bool Exists(User user);
        public bool Exists(string userName);
    }
    public class UsersManager : IUserManager
    {
        private Dictionary<string, User> _users = new Dictionary<string, User>();
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
