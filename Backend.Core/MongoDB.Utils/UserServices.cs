using Backend.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Services
{

    public interface IUserService
    {
        public List<User> GetAll();
        public User GetById(string id);
        public List<User> GetAllInRoom(string roomId);
        public User GetByNameAndRoom(string username, string roomId);
        public User CreateUser(User user);
        public User CreateOwner(User owner, string roomId);
        public void Update(string id, User userIn);
        public void Remove(string id);
        public bool UserExistsInRoom(string username, string roomId);
    }
    public class UserService : IUserService
    {
        public IMongoCollection<User> Users { get; set; }
        public UserService(IDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            Users = database.GetCollection<User>("users");
        }

        public List<User> GetAll() =>
            Users.Find(user => true).ToList();

        public User GetById(string id)
        {
            return Users.Find(Builders<User>
                        .Filter.Eq("Id", id))
                        .FirstOrDefault();
        }
        public List<User> GetAllInRoom(string roomId)
        {
            return Users.Find(Builders<User>
                    .Filter.Eq("RoomId", roomId))
                    .ToList();
        }
        public User GetByNameAndRoom(string username, string roomId)
        {
            var builder = Builders<User>.Filter;
            var filter = builder.Eq("Username", username) & builder.Eq("RoomId", roomId);
            return Users.Find(filter).FirstOrDefault();
        }

        public bool UserExistsInRoom(string userId, string roomId)
        {
            var found = GetById(userId);
            return found != null && found.RoomId == roomId;
        }

        private bool UserWithThisNameExistsInRoom(User user)
        {
            var found = Users.Find<User>
            (u => u.Name == user.Name)
            .FirstOrDefault();
            return found != null;
        }

        /// <summary>
        /// Creates new users in user's with role "user" room
        /// </summary>
        /// <param name="user"> User has to have assigned Username and RoomId</param>
        /// <returns>New created user from MongoDB</returns>
        public User CreateUser(User user)
        {
            if (UserWithThisNameExistsInRoom(user))
                throw new System.Exception("User already exists in this room");

            user.Role = UserRoles.User;
            Users.InsertOne(user);
            return user;
        }

        public User CreateOwner(User owner, string roomId)
        {
            owner.Role = UserRoles.Owner;
            owner.RoomId = roomId;
            Users.InsertOne(owner);
            return owner;
        }

        public void Update(string id, User userIn) =>
            Users.ReplaceOne(user => user.Name == id, userIn);

        public void Remove(string id) =>
            Users.DeleteOne(user => user.Name == id);
    }
}