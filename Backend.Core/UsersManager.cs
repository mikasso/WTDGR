using Backend.Models;
using System;

namespace Backend.Helpers
{
    public class UsersManager : RoomItemsManager<User>
    {
        public bool SetAdmin(string username)
        {
            var admin = Get(username);
            admin.Role = UserRoles.Admin;
            return Update(admin);
        }
        public bool RemoveAdmin(string username)
        {
            var user = Get(username);
            user.Role = UserRoles.User;
            return Update(user);
        }
        public bool AddUser(User user)
        {
            user.Role = UserRoles.User;
            return Add(user);
        }

        public bool Exists(User user)
        {
            return this.objects.ContainsKey(user.Id);
        }

        public bool Exists(String userName)
        {
            return this.objects.ContainsKey(userName);
        }
    }
}
